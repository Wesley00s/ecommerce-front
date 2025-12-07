import { Component, inject } from '@angular/core';
import {
   FormBuilder,
   FormGroup,
   ReactiveFormsModule,
   Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { passwordMatchValidator } from '../../../../core/validators/password-match/password-match.validator';
import { User } from '../../../../core/@types/User';
import { UserType } from '../../../../core/enum/UserType';
import { finalize } from 'rxjs';

@Component({
   selector: 'app-signup',
   imports: [ReactiveFormsModule, RouterLink],
   templateUrl: './sign-up.feature.html',
   styleUrl: './sign-up.feature.sass',
})
export class SignUpFeature {
   private fb = inject(FormBuilder);
   private authService = inject(AuthService);
   private router = inject(Router);

   signUpForm: FormGroup;
   isLoading = false;
   errorMessage: string | null = null;
   successMessage: string | null = null;

   constructor() {
      this.signUpForm = this.fb.group(
         {
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            street: ['', Validators.required],
            city: ['', Validators.required],
            state: ['', Validators.required],
            zip: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
         },
         { validators: passwordMatchValidator },
      );
   }

   formatZip(event: Event): void {
      const input = event.target as HTMLInputElement;
      let value = input.value.replace(/\D/g, '');

      if (value.length > 8) {
         value = value.substring(0, 8);
      }

      if (value.length > 5) {
         value = value.replace(/^(\d{5})(\d)/, '$1-$2');
      }

      input.value = value;
      this.signUpForm.get('zip')?.setValue(value, { emitEvent: false });
   }

   onSubmit(): void {
      if (this.signUpForm.invalid) {
         this.signUpForm.markAllAsTouched();
         return;
      }

      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formValue = this.signUpForm.value;

      const cleanZip = formValue.zip.replace(/\D/g, '');

      const newUser: User = {
         name: formValue.name,
         email: formValue.email,
         password: formValue.password,
         userType: UserType.CUSTOMER,
         street: formValue.street,
         city: formValue.city,
         state: formValue.state,
         zip: cleanZip,
      };

      this.authService
         .save(newUser)
         .pipe(finalize(() => (this.isLoading = false)))
         .subscribe({
            next: () => {
               this.successMessage =
                  'Conta criada com sucesso! Redirecionando para o login...';
               this.signUpForm.reset();
               setTimeout(() => {
                  this.router.navigate(['/sign-in']);
               }, 2000);
            },
            error: (err) => {
               if (err.error?.message) {
                  this.errorMessage = err.error.message;
               } else {
                  this.errorMessage =
                     'Ocorreu um erro ao criar a conta. Tente novamente.';
               }
            },
         });
   }
}
