import {
   Component,
   ElementRef,
   inject,
   OnInit,
   ViewChild,
} from '@angular/core';
import {
   FormBuilder,
   FormGroup,
   ReactiveFormsModule,
   Validators,
} from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import {
   BehaviorSubject,
   catchError,
   finalize,
   map,
   Observable,
   of,
   startWith,
   switchMap,
} from 'rxjs';
import { Pagination } from '../../../../core/@types/Pagination';
import { Product } from '../../../../core/@types/Product';
import { ProductCategoryResponse } from '../../../../core/@types/ProductCategoryResponse';
import { AsyncPipe, NgClass } from '@angular/common';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { SortBy } from '../../../../core/enum/SortBy';
import { SortDirection } from '../../../../core/enum/SortDirection';
import {
   FilterBarComponent,
   FilterChangeEvent,
} from '../../../../shared/components/filter-bar/filter-bar.component';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertModalComponent } from '../../../../shared/components/alert-modal/alert-modal/alert-modal.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

const MAX_SIZE = 10 * 1024 * 1024;

interface ProductFilterState {
   page: number;
   size: number;
   name: string;
   sortBy?: SortBy;
   sortDirection?: SortDirection;
}

@Component({
   selector: 'app-product-management',
   imports: [
      AsyncPipe,
      ReactiveFormsModule,
      ProductTableComponent,
      FilterBarComponent,
      NgClass,
      AlertModalComponent,
      LoadingSpinnerComponent,
   ],
   templateUrl: './product-management.feature.html',
   styleUrl: './product-management.feature.sass',
})
export class ProductManagementFeature implements OnInit {
   private fb = inject(FormBuilder);
   private productService = inject(ProductService);
   private categoryService = inject(CategoryService);
   private toastService = inject(ToastService);
   isDeleteModalOpen = false;
   productIdToDelete: number | null = null;

   isFormVisible = false;

   @ViewChild(FilterBarComponent) filterBar!: FilterBarComponent;

   private initialFilterState: ProductFilterState = {
      page: 0,
      size: 10,
      name: '',
      sortBy: undefined,
      sortDirection: SortDirection.ASC,
   };

   private filterSubject = new BehaviorSubject<ProductFilterState>(
      this.initialFilterState,
   );

   productsState$!: Observable<{
      loading: boolean;
      products: Pagination<Product>;
      error: boolean;
      errorMessage: string;
   }>;

   categories$!: Observable<ProductCategoryResponse[]>;

   productForm!: FormGroup;
   editMode = false;
   currentProductId: number | null = null;
   isSubmitting = false;

   selectedCoverFile: File | null = null;
   coverPreview: string | null = null;
   selectedOtherFiles: File[] = [];
   otherPreviews: string[] = [];
   existingImages: { publicId: string; url: string }[] = [];
   publicIdsToDelete: string[] = [];

   isDraggingCover = false;

   @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;
   @ViewChild('othersInput') othersInput!: ElementRef<HTMLInputElement>;

   ngOnInit(): void {
      this.initForm();
      this.setupProductsStream();
      this.loadCategories();
   }

   initForm(): void {
      this.productForm = this.fb.group({
         name: ['', Validators.required],
         description: ['', Validators.required],
         price: ['', [Validators.required, Validators.min(0)]],
         stock: ['', [Validators.required, Validators.min(0)]],
         categoryName: ['', Validators.required],
      });
   }

   toggleForm() {
      if (this.isFormVisible) {
         this.resetForm();
      } else {
         this.isFormVisible = true;
      }
   }

   loadCategories() {
      this.categories$ = this.categoryService
         .getCategories(0, 100)
         .pipe(map((res) => res.data));
   }

   setupProductsStream() {
      this.productsState$ = this.filterSubject.pipe(
         switchMap((filters) =>
            this.productService
               .getAllProducts(
                  filters.sortBy,
                  filters.sortDirection,
                  filters.name,
                  undefined,
                  filters.page,
                  filters.size,
               )
               .pipe(
                  map((data) => ({
                     loading: false,
                     products: data,
                     error: false,
                     errorMessage: '',
                  })),
                  startWith({
                     loading: true,
                     products: {
                        data: [],
                        pagination: {
                           page: 0,
                           size: 10,
                           totalElements: 0,
                           totalPages: 0,
                        },
                     },
                     error: false,
                     errorMessage: '',
                  }),
                  catchError((err) =>
                     of({
                        loading: false,
                        products: {
                           data: [],
                           pagination: {
                              page: 0,
                              size: 10,
                              totalElements: 0,
                              totalPages: 0,
                           },
                        },
                        error: true,
                        errorMessage: err.message,
                     }),
                  ),
               ),
         ),
      );
   }

   onFilterChange(event: FilterChangeEvent) {
      const currentState = this.filterSubject.value;
      this.filterSubject.next({
         ...currentState,
         name: event.name,
         sortBy: event.sortBy,
         sortDirection: event.sortDirection,
         page: 0,
      });
   }

   onCoverDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDraggingCover = true;
   }

   onCoverDragLeave(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDraggingCover = false;
   }

   onCoverDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDraggingCover = false;

      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
         const file = event.dataTransfer.files[0];
         if (file.type.startsWith('image/')) {
            this.processCoverFile(file);
         } else {
            this.toastService.showWarning(
               'Por favor, solte apenas arquivos de imagem.',
            );
         }
      }
   }

   private processCoverFile(file: File) {
      if (file.size > MAX_SIZE) {
         this.toastService.showWarning('A imagem é muito grande! Máximo 10MB.');
         return;
      }
      this.selectedCoverFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.coverPreview = reader.result as string);
      reader.readAsDataURL(file);
   }

   onCoverChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0)
         this.processCoverFile(input.files[0]);
   }

   onOthersChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
         Array.from(input.files).forEach((file) => {
            this.selectedOtherFiles.push(file);
            const reader = new FileReader();
            reader.onload = () =>
               this.otherPreviews.push(reader.result as string);
            reader.readAsDataURL(file);
         });
      }
   }

   removeNewOtherImage(index: number) {
      this.selectedOtherFiles.splice(index, 1);
      this.otherPreviews.splice(index, 1);
   }

   removeExistingImage(publicId: string) {
      this.existingImages = this.existingImages.filter(
         (img) => img.publicId !== publicId,
      );
      this.publicIdsToDelete.push(publicId);
   }

   onSubmit(): void {
      if (this.productForm.invalid) {
         this.productForm.markAllAsTouched();
         return;
      }

      const formVal = this.productForm.value;
      this.isSubmitting = true;

      if (this.editMode) {
         const updateDto = {
            ...formVal,
            publicIdsToDelete: this.publicIdsToDelete,
         };
         this.productService
            .updateProduct(
               this.currentProductId!,
               updateDto,
               this.selectedCoverFile || undefined,
               this.selectedOtherFiles,
            )
            .pipe(finalize(() => (this.isSubmitting = false)))
            .subscribe({
               next: () => {
                  this.toastService.showSuccess(
                     'Produto atualizado com sucesso!',
                  );
                  this.resetForm();
                  this.filterSubject.next(this.filterSubject.value);
               },
               error: () =>
                  this.toastService.showError('Erro ao atualizar produto.'),
            });
      } else {
         if (!this.selectedCoverFile) {
            this.toastService.showWarning('Imagem de capa é obrigatória!');
            this.isSubmitting = false;
            return;
         }
         this.productService
            .createProduct(
               formVal,
               this.selectedCoverFile,
               this.selectedOtherFiles,
            )
            .pipe(finalize(() => (this.isSubmitting = false)))
            .subscribe({
               next: () => {
                  this.toastService.showSuccess('Produto criado com sucesso!');
                  this.resetForm();
                  if (this.filterBar) this.filterBar.reset();
                  this.filterSubject.next(this.initialFilterState);
               },
               error: () =>
                  this.toastService.showError('Erro ao criar produto.'),
            });
      }
   }

   onEdit(product: Product): void {
      this.isFormVisible = true;
      this.editMode = true;
      this.currentProductId = product.id || null;
      this.productForm.patchValue({
         name: product.name,
         description: product.description,
         price: product.price,
         stock: product.stock,
         categoryName: product.categoryName,
      });
      this.coverPreview = product.coverImageUrl;
      this.selectedCoverFile = null;
      this.existingImages = [];
      if (product.imageUrls) {
         Object.entries(product.imageUrls).forEach(([publicId, url]) => {
            this.existingImages.push({ publicId, url });
         });
      }
      this.publicIdsToDelete = [];
      this.selectedOtherFiles = [];
      this.otherPreviews = [];
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   onDelete(id: number): void {
      this.productIdToDelete = id;
      this.isDeleteModalOpen = true;
   }

   confirmDelete() {
      if (this.productIdToDelete) {
         this.productService.deleteProduct(this.productIdToDelete).subscribe({
            next: () => {
               this.toastService.showSuccess('Produto excluído com sucesso.');
               this.filterSubject.next(this.filterSubject.value);
               this.closeDeleteModal();
            },
            error: () => {
               this.toastService.showError('Erro ao excluir produto.');
               this.closeDeleteModal();
            },
         });
      }
   }

   closeDeleteModal() {
      this.isDeleteModalOpen = false;
      this.productIdToDelete = null;
   }

   resetForm(): void {
      this.productForm.reset();
      this.editMode = false;
      this.currentProductId = null;
      this.selectedCoverFile = null;
      this.coverPreview = null;
      this.selectedOtherFiles = [];
      this.otherPreviews = [];
      this.existingImages = [];
      this.publicIdsToDelete = [];
      this.isFormVisible = false;
      if (this.coverInput) this.coverInput.nativeElement.value = '';
      if (this.othersInput) this.othersInput.nativeElement.value = '';
   }

   nextPage(current: number, total: number) {
      if (current < total - 1) {
         const currentState = this.filterSubject.value;
         this.filterSubject.next({ ...currentState, page: current + 1 });
      }
   }

   prevPage(current: number) {
      if (current > 0) {
         const currentState = this.filterSubject.value;
         this.filterSubject.next({ ...currentState, page: current - 1 });
      }
   }
}
