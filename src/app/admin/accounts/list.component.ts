import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { first } from 'rxjs/operators';
import { AccountService } from '@app/_services';

@Component({ 
    templateUrl: 'list.component.html',
    standalone: false
})
export class ListComponent implements OnInit {
    accounts: any[] = [];

    constructor(
        private accountService: AccountService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        setTimeout(() => {
            this.accountService.getAll()
                .pipe(first())
                .subscribe({
                    next: (accounts: any[]) => {
                        this.accounts = accounts;
                        this.cdr.detectChanges();
                    },
                    error: (err: any) => console.error(err)
                });
        }, 500);
    }

    deleteAccount(id: string) {
        const account = this.accounts.find(x => x.id === id);
        if (!account) return;
        account.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts.filter(x => x.id !== id);
                this.cdr.detectChanges();
            });
    }
}