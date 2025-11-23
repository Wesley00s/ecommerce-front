import {
   Component,
   ElementRef,
   inject,
   OnInit,
   ViewChild,
} from '@angular/core';
import {
   FormBuilder,
   FormControl,
   FormGroup,
   ReactiveFormsModule,
   Validators,
} from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import {
   BehaviorSubject,
   catchError,
   debounceTime,
   distinctUntilChanged,
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
import { AsyncPipe } from '@angular/common';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { SortBy } from '../../../../core/enum/SortBy';
import { SortDirection } from '../../../../core/enum/SortDirection';

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
   imports: [AsyncPipe, ReactiveFormsModule, ProductTableComponent],
   templateUrl: './product-management.feature.html',
   styleUrl: './product-management.feature.sass',
})
export class ProductManagementFeature implements OnInit {
   private fb = inject(FormBuilder);
   private productService = inject(ProductService);
   private categoryService = inject(CategoryService);

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

   searchControl = new FormControl('');
   sortControl = new FormControl<SortBy | null>(null);
   directionControl = new FormControl<SortDirection>(SortDirection.ASC);

   readonly SortBy = SortBy;
   readonly SortDirection = SortDirection;

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

   selectedCoverFile: File | null = null;
   coverPreview: string | null = null;

   selectedOtherFiles: File[] = [];
   otherPreviews: string[] = [];

   existingImages: { publicId: string; url: string }[] = [];
   publicIdsToDelete: string[] = [];

   isSubmitting = false;

   @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;
   @ViewChild('othersInput') othersInput!: ElementRef<HTMLInputElement>;

   isDraggingCover = false;

   ngOnInit(): void {
      this.initForm();
      this.setupProductsStream();
      this.setupFilters();
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

   loadCategories() {
      this.categories$ = this.categoryService
         .getCategories(0, 100)
         .pipe(map((res) => res.data));
   }

   setupFilters() {
      this.searchControl.valueChanges
         .pipe(debounceTime(400), distinctUntilChanged())
         .subscribe((term) => {
            const currentState = this.filterSubject.value;
            this.filterSubject.next({
               ...currentState,
               name: term || '',
               page: 0,
            });
         });

      this.sortControl.valueChanges.subscribe((sort) => {
         const currentState = this.filterSubject.value;
         this.filterSubject.next({
            ...currentState,
            sortBy: sort || undefined,
            page: 0,
         });
      });

      this.directionControl.valueChanges.subscribe((dir) => {
         const currentState = this.filterSubject.value;
         this.filterSubject.next({
            ...currentState,
            sortDirection: dir || SortDirection.ASC,
            page: 0,
         });
      });
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
         }
      }
   }

   private processCoverFile(file: File) {
      if (file.size > MAX_SIZE) {
         alert('A imagem é muito grande! Máximo 10MB.');
         return;
      }

      this.selectedCoverFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.coverPreview = reader.result as string);
      reader.readAsDataURL(file);
   }

   onCoverChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
         this.processCoverFile(input.files[0]);
      }
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
      if (this.productForm.invalid) return;

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
            .subscribe(() => {
               this.resetForm();
               this.filterSubject.next(this.filterSubject.value);
            });
      } else {
         if (!this.selectedCoverFile) {
            alert('Imagem de capa é obrigatória!');
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
            .subscribe(() => {
               this.resetForm();
               this.searchControl.setValue('');
               this.filterSubject.next(this.initialFilterState);
            });
      }
   }

   onEdit(product: Product): void {
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

      window.scrollTo(0, 0);
   }

   onDelete(id: number): void {
      if (confirm('Deseja excluir este produto?')) {
         this.productService.deleteProduct(id).subscribe(() => {
            this.filterSubject.next(this.filterSubject.value);
         });
      }
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
