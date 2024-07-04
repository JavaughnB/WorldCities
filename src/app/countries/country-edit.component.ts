import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Country } from './country';

@Component({
  selector: 'app-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrls: [ './country-edit.component.scss'
  ]
})
export class CountryEditComponent implements OnInit {
  title? :string;
  form! :FormGroup;
  country? : Country;
  id?: number;
  countries? : Country[];

  constructor(
    private fb: FormBuilder,
    private activateRoute : ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required,this.isDupeField("name")],
      is02:['',[ Validators.required,Validators.pattern(/^[a-zA-Z]{2}$/)], this.isDupeField("iso2") ],  
      iso3:['',[ Validators.required, Validators.pattern(/^[a-zA-Z]{3}$/)], this.isDupeField("iso3")]
    });
   this.loadData();
  }
  loadData() {
    var idParam = this.activateRoute.snapshot.paramMap.get('id');
    this.id = idParam ? + idParam :0;
    if(this.id){
      var url = environment.apiBaseUrl + "Countries/" +this.id;
      this.http.get<Country>(url).subscribe(result => {
        this.country = result;
        this.title   = "Edit - " + this.country.name;
        this.form.patchValue(this.country);
      },error => console.error(error));
    }else {
      this.title = "Create a new Country";
    }
  }
  onSubmit() {
    var country =  (this.id) ? this.country : <Country>{};
    if(country){
      country.name = this.form.controls['name'].value;
      country.iso2 = this.form.controls['iso2'].value;
      country.iso3 = this.form.controls['iso3'].value;
    }
    if(this.id){
      var url = environment.apiBaseUrl +"Countries/" +this.id;
      this.http
          .put<Country>(url,country)
          .subscribe(result =>{
              console.log("Country " + country!.name + "has been updated")
          }, error => console.error(error));
    }
    else{
      var url = environment.apiBaseUrl + "Countries";
      this.http 
          .post<Country>(url,country)
          .subscribe(result => {
            console.log("Country " +country!.name + "has been created")
          },error => console.error(error));
    }
  }
  isDupeField (fieldName: string){
      return (control: AbstractControl): Observable <{
        [key:string] :any
        } | null > => {
        var params = new HttpParams()
          .set("countryId", (this.id) ? this.id.toString() : "0")
          .set("fieldName", fieldName)
          .set("fieldValue", control.value);
        var url = environment.apiBaseUrl + 'Countries/IsDupeField';
        return this.http.post<boolean>(url,null,{params})
                .pipe(map(result => {
                  return (result ? {isDupeField:true} : null);
                }))
      }
  }
}
