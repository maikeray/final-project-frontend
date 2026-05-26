import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

        constructor(
        private router: Router,
        private http: HttpClient
    ) {
        const storedAccount = localStorage.getItem('account');
        const initialAccount = storedAccount ? JSON.parse(storedAccount) : null;
        this.accountSubject = new BehaviorSubject<Account | null>(initialAccount);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue() {
        return this.accountSubject.value;
    }

    login(email: string, password: string) {
    return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
        .pipe(map(account => {
            localStorage.setItem('account', JSON.stringify(account));
            this.accountSubject.next(account);
            this.startRefreshTokenTimer();
            return account;
        }));
}

    logout() {
        localStorage.removeItem('account');
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
}

refreshToken() {
    return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
        .pipe(
            map((account) => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }),
            catchError(() => {
                return of(null);
            })
        );
}

    register(params: any) {
        return this.http.post(`${baseUrl}/register`, params);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }

    create(params: any) {
        return this.http.post(baseUrl, params);
    }

    update(id: string, params: any) {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: any) => {
                if (account.id === this.accountValue?.id) {
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                if (id === this.accountValue?.id)
                    this.logout();
            }));
    }

    private refreshTokenTimeout?: any;

private startRefreshTokenTimer() {
    // Disabled for cross-domain deployment
}

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}