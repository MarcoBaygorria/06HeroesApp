import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  //Formulario Reactivo
  public heroForm = new FormGroup({
    id: new FormControl<string>('', { nonNullable: true }),
    superhero: new FormControl<string>(''),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl(''),

  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  constructor(
    private heroesServices: HeroesService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero
    return hero;
  }

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activateRoute.params
      .pipe(
        switchMap(({ id }) => this.heroesServices.getHeroById(id)),
      ).subscribe(hero => {

        if (!hero) return this.router.navigateByUrl('/');

        this.heroForm.reset(hero);
        return;
      });
  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;

    if (this.currentHero.id) {
      this.heroesServices.updateHero(this.currentHero)
        .subscribe(hero => {
          this.showSnackBar(`${hero.superhero} Updated!`)
        });
      return;
    }

    this.heroesServices.addHero(this.currentHero)
      .subscribe(hero => {
        //TODO mostrar snackbar  and navigate a /heroes/edit/hero.id
        this.router.navigate(['/heroes/edit', hero.id])
        this.showSnackBar(`${hero.superhero} Created!`)
      })
    //this.heroesServices.updateHero(this.heroForm.value);
  }

  onDeleteHero() {
    if (!this.currentHero.id) throw Error('Hero id is required');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed()
      .pipe(
        filter((result: boolean) => result),
        switchMap(() => this.heroesServices.deleteHero(this.currentHero.id)),
        filter((wasDeleted: boolean) => wasDeleted),
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']);
      });
  }

  showSnackBar(message: string): void {
    this.snackbar.open(message, 'Done', {
      duration: 2500,
    });
  }

}
