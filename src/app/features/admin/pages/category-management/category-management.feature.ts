import {
   Component,
   ElementRef,
   ViewChild,
   inject,
   OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
   ReactiveFormsModule,
   FormBuilder,
   FormGroup,
   Validators,
   FormControl,
} from '@angular/forms';
import {
   BehaviorSubject,
   Observable,
   catchError,
   map,
   of,
   startWith,
   switchMap,
   tap,
   debounceTime,
   distinctUntilChanged,
   finalize,
} from 'rxjs';

import { ProductCategoryResponse } from '../../../../core/@types/ProductCategoryResponse';
import { Pagination } from '../../../../core/@types/Pagination';
import { CategoryService } from '../../../../core/services/category.service';
import { CategoryTableComponent } from '../../components/category-table/category-table.component';

@Component({
   selector: 'app-category-management',
   imports: [CommonModule, ReactiveFormsModule, CategoryTableComponent],
   templateUrl: './category-management.feature.html',
   styleUrl: './category-management.feature.sass',
})
export class CategoryManagementFeature implements OnInit {
   private fb = inject(FormBuilder);
   private categoryService = inject(CategoryService);

   isDragging = false;
   searchControl = new FormControl('');
   isSubmitting = false;

   private readonly initialPaginationState: Pagination<ProductCategoryResponse> =
      {
         data: [],
         pagination: {
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
         },
      };

   private pageSubject = new BehaviorSubject<number>(0);

   categoriesState$!: Observable<{
      loading: boolean;
      categories: Pagination<ProductCategoryResponse>;
      error: boolean;
      errorMessage: string;
   }>;

   private currentPagination = this.initialPaginationState.pagination;
   currentCategoriesList: ProductCategoryResponse[] = [];

   categoryForm!: FormGroup;
   selectedFile: File | undefined = undefined;
   editMode = false;
   currentCategoryId: number | null = null;
   imagePreview: string | null = null;

   @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

   ngOnInit(): void {
      this.initForm();
      this.setupSearchListener();
      this.setupCategoriesStream();
   }

   initForm(): void {
      this.categoryForm = this.fb.group({
         name: ['', Validators.required],
         description: ['', Validators.required],
         image: [null as File | null],
      });
   }

   setupSearchListener() {
      this.searchControl.valueChanges
         .pipe(debounceTime(300), distinctUntilChanged())
         .subscribe(() => {
            this.pageSubject.next(0);
         });
   }

   setupCategoriesStream() {
      this.categoriesState$ = this.pageSubject.pipe(
         switchMap((page) => {
            const searchTerm = this.searchControl.value || '';

            return this.categoryService
               .getCategories(page, this.currentPagination.size, searchTerm)
               .pipe(
                  tap((data) => {
                     this.currentPagination = data.pagination;
                     this.currentCategoriesList = data.data;
                  }),
                  map((data) => ({
                     loading: false,
                     categories: data,
                     error: false,
                     errorMessage: '',
                  })),
                  startWith({
                     loading: true,
                     categories: this.initialPaginationState,
                     error: false,
                     errorMessage: '',
                  }),
                  catchError((err) => {
                     return of({
                        loading: false,
                        categories: this.initialPaginationState,
                        error: true,
                        errorMessage:
                           err.message || 'Erro ao carregar categorias',
                     });
                  }),
               );
         }),
      );
   }

   private processFile(file: File) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
         this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
   }

   onFileChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
         this.processFile(input.files[0]);
      }
   }

   onDragOver(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = true;
   }

   onDragLeave(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
   }

   onDrop(event: DragEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;

      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
         const file = event.dataTransfer.files[0];
         if (file.type.startsWith('image/')) {
            this.processFile(file);
         } else {
            alert('Por favor, solte apenas arquivos de imagem.');
         }
      }
   }

   onSubmit(): void {
      if (this.categoryForm.invalid) return;

      const { name, description } = this.categoryForm.value;

      this.isSubmitting = true;
      if (this.editMode) {
         this.categoryService
            .updateCategory(
               this.currentCategoryId!,
               name,
               description,
               this.selectedFile,
            )
            .pipe(finalize(() => (this.isSubmitting = false)))
            .subscribe(() => {
               this.resetForm();
               this.pageSubject.next(this.currentPagination.page);
            });
      } else {
         if (!this.selectedFile) {
            console.error('Nenhuma imagem selecionada!');
            this.isSubmitting = false;
            return;
         }

         this.categoryService
            .createCategory(name, description, this.selectedFile)
            .pipe(finalize(() => (this.isSubmitting = false)))
            .subscribe(() => {
               this.resetForm();
               this.searchControl.setValue('');

               this.categoryService
                  .getCategories(0, this.currentPagination.size)
                  .subscribe((response) => {
                     const lastPage =
                        response.pagination.totalPages > 0
                           ? response.pagination.totalPages - 1
                           : 0;
                     this.pageSubject.next(lastPage);
                  });
            });
      }
   }

   onEdit(category: ProductCategoryResponse): void {
      this.editMode = true;
      this.currentCategoryId = category.id;
      this.imagePreview = category.imageUrl;
      this.categoryForm.patchValue({
         name: category.name,
         description: category.description,
      });
      window.scrollTo(0, 0);
   }

   onDelete(id: number): void {
      if (confirm('Tem certeza que deseja excluir esta categoria?')) {
         this.categoryService.deleteCategory(id).subscribe(() => {
            if (
               this.currentCategoriesList.length === 1 &&
               this.currentPagination.page > 0
            ) {
               this.pageSubject.next(this.currentPagination.page - 1);
            } else {
               this.pageSubject.next(this.currentPagination.page);
            }
         });
      }
   }

   resetForm(): void {
      this.categoryForm.reset();
      this.selectedFile = undefined;
      this.editMode = false;
      this.currentCategoryId = null;
      this.imagePreview = null;
      if (this.fileInput) {
         this.fileInput.nativeElement.value = '';
      }
   }

   nextPage(): void {
      if (this.currentPagination.page < this.currentPagination.totalPages - 1) {
         this.pageSubject.next(this.currentPagination.page + 1);
      }
   }

   prevPage(): void {
      if (this.currentPagination.page > 0) {
         this.pageSubject.next(this.currentPagination.page - 1);
      }
   }
}
