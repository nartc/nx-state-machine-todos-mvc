# TodosMVC with XState and NX

![https://i.imgur.com/BLQFJ5u.gif](https://i.imgur.com/BLQFJ5u.gif)

This repository implements **TodoMVC** project ([TodoMVC](http://todomvc.com/)) utilizing **[XState](https://xstate.js.org/)** by [David K.](https://twitter.com/DavidKPiano) and **[NX](https://nx.dev)**

## Run
1. Clone this repository
2. Run `npm install`
3a. Run Angular app: `npx ng serve todos`
3b. Run React app: `npx ng serve todos-react`
(you'd need different ports if you run both at the same time)
4. Check `localhost:{port}` (default to 4200)

## Information

`xstate` provides a nice APIs to implement `State Machine` in the application. Two Machines `todosMachine` and `todoMachine` are re-used for both **Angular** and **React** applications. 
The project uses `TodoMVC` template and the library `todomvc-app-css` for the `CSS`.

## Angular

On the Angular side, this project utilized `Observable View Model` pattern to transform the `State Machine` context to data to be used on the template with the `async` pipe.
The Machines are set up in `TodosMachineService` and `TodoMachineService`.

## React

On the React side, this project uses `React Hooks` and `@xstate/react` to wire up the Machines to **React** components.

## Other README

- [Data](./libs/data)
- [Machine](./libs/machine)
- [Angular Common](./libs/ng-common)
- [Angular Todos](./libs/ng-todos)
- [React Common](./libs/react-common)
- [React Todos](./libs/react-todos)

## Thank you for checking out the repo
 

