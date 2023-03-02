# AerosmithSystemCalculator

#### Written in version 8 of Angular2. Recommend at least Node v16 installed on a system building the project.
#### Once cloned, run `npm install` and then `npm start` in the project root directory to start the project.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Architectural notes

There are no backend components, just front end. 
The vast majority of animations, including rescaling for both responsiveness and for printing is done by 
manipulating and scaling SVGs. 
This is currently the largest source of complexity in the application.

## Future improvements

Recommendations for future improvement of this behavior would be to replace 
the direct manipulation and scaling of SVGs with a library like fabric.js or a WebGL based Javascript framework. 
