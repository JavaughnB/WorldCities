import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Country } from './country';
import { BaseFormComponent } from '../base-form.component';
import { BaseService } from '../base.service';
import { ApiResult } from '../base.service';
import { CountryService } from './country.service';

@Component({
  selector: 'app-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrls: [ './country-edit.component.scss']
})
export class CountryEditComponent extends BaseFormComponent implements OnInit {
  title? :string;
  country? : Country;
  id?: number;
  countries? : Country[];

  constructor(
    private fb: FormBuilder,
    private activateRoute : ActivatedRoute,
    private router: Router,
    private countryService: CountryService
  ) { 
    super();

  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required,this.isDupeField("name")],
      iso2:['',[ Validators.required,Validators.pattern(/^[a-zA-Z]{2}$/)], this.isDupeField("iso2") ],  
      iso3:['',[ Validators.required, Validators.pattern(/^[a-zA-Z]{3}$/)], this.isDupeField("iso3")]
    });
   this.loadData();
  }
  loadData() {
    var idParam = this.activateRoute.snapshot.paramMap.get('id');
    this.id = idParam ? + idParam :0;
    if(this.id){
      this.countryService.get(this.id).subscribe(result => {
        this.country = result;
        this.title   = "Edit - " + this.country.name;
        this.form.patchValue(this.country);
      },error => console.error(error));
    }else {
      this.title = "Create a new Country";
    }
  }
  onSubmit() {
     var country  =  (this.id) ? this.country : <Country>{};
    if(country)
      {
        country.name = this.form.controls['name'].value;
        country.iso2 = this.form.controls['iso2'].value;
        country.iso3 = this.form.controls['iso3'].value;
      
      if(this.id){
        this.countryService
            .put(country)
            .subscribe(result =>{
                console.log("Country " + country!.name + "has been updated")
            }, error => console.error(error));
      }
      else{
        var url = environment.apiBaseUrl + "Countries";
        this.countryService
            .post(country)
            .subscribe(result => {
              console.log("Country " + country!.name + "has been created")
            },error => console.error(error));
      }
    }
  }
  isDupeField (fieldName: string): AsyncValidatorFn{
      return (control: AbstractControl): Observable <{[key:string] :any } | null> => {      
        return this.countryService.isDupeField(this.id ?? 0,fieldName,control.value)
                .pipe(map(result => {
                  return (result ? {isDupeField:true} : null);
                }));
      }
  }
}
