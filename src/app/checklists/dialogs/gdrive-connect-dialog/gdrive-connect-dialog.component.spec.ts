import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { firstValueFrom, toArray } from 'rxjs';
import { GoogleDriveConnectDialogComponent } from './gdrive-connect-dialog.component';

describe('GoogleDriveConnectDialogComponent', () => {
  let fixture: ComponentFixture<GoogleDriveConnectDialogComponent>;
  let loader: HarnessLoader;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleDriveConnectDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleDriveConnectDialogComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  beforeEach(inject([MatDialog], (d: MatDialog) => {
    dialog = d;
  }));

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should open and cancel the dialog', async () => {
    const dialogRef = dialog.open(GoogleDriveConnectDialogComponent);

    let dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    await dialogs[0].close();
    dialogs = await loader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(0);

    const returnValues = await firstValueFrom(dialogRef.afterClosed().pipe(toArray()), { defaultValue: ['FAIL'] });
    expect(returnValues).toEqual(jasmine.arrayWithExactContents([]));
  });

  // TODO: Add tests for return value when user confirms.
});
