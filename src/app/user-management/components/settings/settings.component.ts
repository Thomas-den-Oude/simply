import { Component, computed, inject, Signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { Devices } from '../../../base/models/devices';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { User } from '@angular/fire/auth';

import { AuthenticationService } from '../../../base/services/authentication.service';
import { ResponsiveService } from '../../../base/services/responsive.service';
import { RemoveAccountComponent } from '../remove-account/remove-account.component';
import { AuthenticationMessages } from '../../../base/models/authentication-messages';
import { ErrorMessageComponent } from '../../../base/components/error-message/error-message.component';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [NgClass, MatIcon, MatDivider, MatButton, ErrorMessageComponent],
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.scss',
})
export class SettingsComponent {
	private authService: AuthenticationService = inject(AuthenticationService);
	private responsiveService: ResponsiveService = inject(ResponsiveService);
	private matDialog: MatDialog = inject(MatDialog);

	protected userEmail: Signal<string> = computed(
		() => this.authService.user()?.email ?? ''
	);
	protected authenticationMessage: Signal<AuthenticationMessages> =
		this.authService.authenticationMessage;
	protected device: Signal<Devices> = this.responsiveService.device;
	protected readonly Devices = Devices;

	protected logout(): void {
		this.authService.logout();
	}

	protected openRemoveAccountDialog(): void {
		const removeDialog = this.matDialog.open<
			RemoveAccountComponent,
			null,
			boolean
		>(RemoveAccountComponent);

		removeDialog.afterClosed().subscribe((remove: boolean | undefined) => {
			if (remove) {
				const user: User | null = this.authService.user();
				if (user) {
					this.authService
						.deleteUser(user)
						.then(() => {
							this.authService.logout();
						})
						.catch(error => {
							this.authService.updateAuthenticationMessage(
								AuthenticationMessages.FailedDeleteUser
							);
						});
				}
				this.authService.updateAuthenticationMessage(
					AuthenticationMessages.FailedDeleteUser
				);
			}
		});
	}

	protected readonly AuthenticationMessages = AuthenticationMessages;
}
