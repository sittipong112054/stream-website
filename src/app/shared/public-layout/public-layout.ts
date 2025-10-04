import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../layouts/header/header';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss'
})
export class PublicLayout {

}
