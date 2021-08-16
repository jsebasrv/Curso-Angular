import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment'


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})


export class DishdetailComponent implements OnInit {

  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('fform') commentFormDirective;
  rating: number = 0;
  dishcopy: Dish

  formErrors = {
    'author': '',
    'comment': ''
  };


  validationMessages = {
    'author': {
      'required': 'First Name requiered.',
      'minlength': 'First Name must be at least 2 characters.',
      'maxlenght': 'First Name cannot be more than 25 characters.'
    },
    'comment': {
      'required': 'Comment is requiered.',
      'minlength': 'Comment must be at least 2 characters.',
      'maxlenght': 'Comment cannot be more than 200 characters.'
    }
  }

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
    this.createForm();
  }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy =dish; this.setPrevNext(dish.id);},
      errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }



  formatLabel(value: number) {
    this.rating = value;
    if (value > 5) {
      return Math.round(value / 5);
    }
    return value;
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      rating: [5]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data))

    this.comment = this.commentForm.value;
  }


  onValueChanged(data?: any) {

    if (!this.commentForm) { return; }

    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        console.log(data)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' '
            }
          }
        }
      }
    }
  }

  onSubmit() {
    console.log("estoy en el on submit")
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      }),
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess;}

    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      firstname: '',
      comment: '',
      rating: 5
    });

  }

}