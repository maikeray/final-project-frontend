import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
    return () => Promise.resolve();
}