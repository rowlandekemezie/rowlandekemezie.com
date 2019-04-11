---
template: post
title: Handling Ajax in Your React Application
slug: /posts/handling-ajax-in-your-react-application-with-agility/
draft: false
date: '2016-11-02T22:40:32.169Z'
description: ReactJS ecosystem has become huge since Facebook made the API public. More so, great libraries have been built in the declarative style adopted by React. However, real life applications require making AJAX requests to servers. And this can pose a great challenge while using React. You need to know what library to use for your AJAX processes. 
category: Software
tags:
  - react
  - redux
  - redux-saga
  - redux-thunk
  - ajax
image: ./images/handling-ajax.png
---

![handling ajax](/images/handling-ajax.png)


The [React](https://facebook.github.io/react/) ecosystem has become huge since Facebook made the API public. More so, great libraries have been built in the declarative style adopted by React.

However, real life applications require making AJAX requests to servers. And this can pose a great challenge while using React. You need to know what library to use for your AJAX processes.

It’s good to know that there are different ways to handle AJAX with React. This is one of the beauties of React as a [VIEW library ](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) — *flexibility*.

## How to make AJAX request with React

1. Within React component.

1. Delegate Relay.

1. Delegate Redux.

## 1. Within React Component

This is the simplest and the most common approach for AJAX requests. Here, the AJAX request is issued directly in the [componentDidMount](http://www.tutorialspoint.com/reactjs/reactjs_component_life_cycle.htm) lifecycle method of your component. Things can get messed up this way as your application grows.

*A request to Github API to get user details looks like this:*

```js
// UserProfile Component
class UserProfile extends React.Component {
  constructor() {
    super();
    this.state = {
      user: []
    }
  }
  /** componentDidMount lifecycle method allows dynamic behaviour, 
   AJAX, side effects, etc. We issue our API call  
   here and set the response to component's state.
  **/
  componentDidMount() {
    gitHubApi('rowlandekemezie').then(data => {
      this.setState({
        user: data
      });
    })
  }

  // Here, we destructure component's state and  render the user details.
  render() {
    const { user } = this.state;
    return <div>
      <h1> User details </h1>
      <img src={user.avatar_url} />
      <p><a href={user.html_url}>{user.login}</a></p>
    </div>
  }
}

/** 
 Function that calls our specified endpoint on Github. We're 
 using **fetch** method from **fetch API** to make the call.
**/
const gitHubApi = (username) => {
  return fetch(`https://api.github.com/users/${username}`)
    .then(response => response.json())
    .then(({ login, avatar_url, html_url }) => ({ 
      login, avatar_url, html_url 
    }))
    .catch(error => {
      throw error;
    })
};

// We mount the UserProfile component to the DOM
ReactDOM.render(
  <UserProfile />, 
  document.getElementById('root')
);
```

*Let’s test it out…*
https://codepen.io/rowlandekemezie/pen/AXNBoK


## **2. Delegate Relay**

[Relay](https://facebook.github.io/relay/) allows you to declare the data requirements for your components with GraphQL. And relay makes them available via props.

Relay is elegant for building large applications — but it has some overhead. This ranges from learning relay and GraphQL to setting up GraphQL servers.

*A sample relay flow could look thus:*

![https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html](/images/relay-workflow.png)
[facebook news feed with relay](https://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html)

## **3. Delegate Redux**

[Redux](http://redux.js.org/) is built off of [Flux architecture](https://facebook.github.io/flux/docs/overview.html) for managing React application’s state. With Redux, you move your application data and AJAX processes away from your components.

![Redux workflow example](/images/redux-github-workflow.png)
*Redux workflow example*

From the diagram, you can see how the application state and asynchronous processes are moved to the store.

[Store](http://redux.js.org/docs/api/Store.html#dispatch) is an object that holds the complete state of your app. Note that in Redux, all application states are stored as a single object. The only way to change its state is by [dispatching actions](http://redux.js.org/docs/api/Store.html#dispatch). With this implementation, you maintain a single source of truth across your application.

[Reducers](http://redux.js.org/docs/basics/Reducers.html) are just pure functions that take the previous state and an action and then return the new state. It does not mutate state; it makes a copy of the previous state, transforms it, and returns a new state to the store. The store then updates the view with the new state if there are changes.
> **Reducers**, given the same arguments, should calculate the next state and return it. No surprises. No side effects. No API calls. No mutations. Reducers are synchronous and passive, thus not the ideal place for async actions.

```js
(previousState, action) => newState
```

**How then should you handle operations with side effects?**

*Redux async libraries comes to rescue:*

1. [Redux-promise](https://github.com/acdlite/redux-promise)

1. [Redux-thunk](https://github.com/gaearon/redux-thunk)

1. [Redux-saga](https://github.com/yelouafi/redux-saga)

They are Redux middlewares for handling async tasks and side effects in your React/Redux application.

**Redux-promise** uses Flux standard actions and promises to bring clear conventions to async calls. It’s the least popular among the three. It is a middleware function that receives a promise and dispatches the resolved value of the promise. It basically returns a promise to the caller so that it can wait for the operation to finish before continuing.

**Redux-thunk** allows an action creator to return a function instead of an action object. This way, the action creator becomes a [thunk](https://en.wikipedia.org/wiki/Thunk).

A **thunk** is a function that is created, often automatically, to assist a call to another function (e.g API endpoint). A thunk wraps an asynchronous operation in a function.

When an action creator returns a function, that function will get executed by the Redux Thunk middleware. This function doesn’t need to be pure; thus, it is allowed to have side effects, including executing asynchronous API calls or router transition. The function can also dispatch actions.

To enable Redux Thunk, we use [applyMiddleware()](http://redux.js.org/docs/api/applyMiddleware.html).
> If Redux Thunk middleware is enabled, any time you attempt to dispatch a function instead of an action object, the middleware will call that function with dispatch method as the first argument.

Check [here](http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559) as [Dan Abramov](https://www.codementor.io/gaearon), the creator of Redux, and Redux-thunk gives a detailed explanation of use cases.

We can dispatch both plain object actions and other thunks, which lets us compose the asynchronous actions in a single flow.

```js
// Dependencies
import { applyMiddleware, createStore } from 'redux';
import { connect, Provider } from 'react-redux';

// GitHub API
const gitHubApi = (username) => {
   // Put your Api call here
};

// redux-thunk implementation
// source: https://github.com/gaearon/redux-thunk/blob/master/src/index.js
// Redux-thunk handles most use cases for async actions in your application
function thunkMiddleware(store) {
  return function(next) {
    return function(action) {
      if (typeof action === "function") {
        return action(store.dispatch, store.getState);
      } else {
        return next(action);
      }
    }
  }
}

// Action creator
const getUserSuccess = (user) => {
  return {
    type: 'LOAD_USER_SUCCESS',
    user
  }
}

// User reducer implementation.
// Simply returns the new user object to the store on LOAD_USER_SUCCESS.
// Always remember to return state as the default case
const userReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_USER_SUCCESS':
      return action.user;
    default:
      return state;
  }
};

// fetchUserDetails thunk
// It returns a function that takes dispatch as the first argument. When AJAX 
// request is successful, it dispatches getUserSuccess action with user object.
const fetchUserDetails = (username) => {
  return dispatch => {
   return gitHubApi(username)
     .then(user => {
        dispatch(getUserSuccess(user))
    })
     .catch(error => { throw error; })
  }
}

// React component
class UserProfile extends React.Component {
  constructor() {
    // State object
  }

  // We call our thunk here. 
  // componentDidmount is for dynamic behavior, side effects, AJAX, etc.
  componentDidMount() {
    this.props.fetchUserDetails('rowlandekemezie');
  }

  render() {
    const { user } = this.props;
      return (
        // Display the user value received from the store
      )
    }
}

// Setup store
const store = createStore(userReducer, applyMiddleware(thunkMiddleware));

// Map the store's state to component's props. 
// This way you keep the component in sync with Redux store
const mapStateToProps = (state) =>  ({ 
    user: state 
});

// Wrap the thunk with dispatch method and
// merge them to component's props
const mapDispatchToProps = (dispatch) => ({
    fetchUserDetails: (username) => dispatch(fetchUserDetails(username)) 
});

// Connect React component to Redux store with React-redux connect() 
const UserProfilePage = connect(
    mapStateToProps, 
    mapDispatchToProps
    )(UserProfile);

// Mount the component to the DOM 
// Provider makes available the store's state to component's below 
// the hierarchy via connect() call.
const element = document.getElementById('root');
ReactDOM.render(
  <Provider store={store}>
    <UserProfilePage />
  </Provider>,
  element, 0
);
```


Redux-thunk is easy to learn with relatively small API — Just ten lines of code. But can be difficult to test.

*Let’s test it out …*

https://codepen.io/rowlandekemezie/pen/AXNBoK

Still curious, see another [Async action](https://github.com/reactjs/redux/tree/master/examples/async) example.

[Redux-saga](http://yelouafi.github.io/redux-saga/) is a Redux middleware that eliminates the complexity of asynchronous processes within your React/Redux application. It leverages the power of [ES6 generators](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*) to make async tasks easy to test, write, and reason.

Redux-saga manages async request and side effects in a more terse way than other middlewares for this. It reduces complexities in such requests by making **callbacks, promises, try/catch** blocks to just simple instructions. More so, it makes your code declarative, more testable and readable. Whereas you could use **Redux-thunk** and **Redux-saga** together, Sagas are just the thing to cure your complex workflow pains.
> When your store needs to handle complex async operations, consider using Redux-saga. It handles asynchronous operations as simple instructions. Redux-saga manages async tasks elegantly, keeping your reducer pure.

### ***A) Define Sagas***

```js
// Here, we use ES6 destructuring assignment to extract payload
// from the action object passed to it.
function* loadUserDetails({ payload }) {
  try {
    const user = yield call(gitHubApi, payload);
    // Yields effect to the reducer specifying action type 
    // and user details.
    yield put({type: 'LOAD_USER_SUCCESS', user}); 
  } catch (error) {
    yield put({ type: 'LOAD_USER_FAILURE', error });
  }
}
// Call loadUserDetails with action's payload each time 
// LOAD_USER_REQUEST is dispatched
function* watchRequest() {
  yield takeLatest('LOAD_USER_REQUEST', loadUserDetails);
}
```

Sagas are generator functions. It uses the ES6 generator. Check out **Kyle** **Simpson’s** article on [Basics of ES6 generator.](https://davidwalsh.name/es6-generators)

Generators are functions that can be paused and resumed. Because of the way generators work, Redux-saga is able to make complex asynchronous workflows look synchronous.

We have two sagas to complete this operation: **watchRequest** and **loadUserDetails**. Sagas are identified by * in front of the function.

Redux-saga API exposes some methods which we need to complete our task:

1. **call** is an effect creator that runs a function with optional parameters. It suspends the generator as the result returned is a promise. The generator is resumed when the promise is resolved or rejected.

1. **fork** is an effect creator for making non-blocking calls on a function.

1. **takeLatest** cancels any current operation and return the result of the latest action that matches its pattern.

1. **takeEvery** returns the result of all actions that matches its pattern.

1. **put** simply puts/dispatches actions to specified channel *(an object used to send and receive messages).*

Check out the [documentation](https://github.com/yelouafi/redux-saga/tree/master/docs/api#channel) for more.

***Back to our code***.

* **takeLatest** watches for LOAD_USER_REQUEST actions to be dispatched.

* It then makes a non-blocking call to **loadUserDetails** with the returned action object. In this case, the action type and username.

* **call** runs the **gitHubApi** function with the payload(i.e username) and resolves the value assigned as **user.**

* Now, **put** dispatches LOAD_USER_SUCCESS with the user value back to the store.

* Finally, if the operation fails, it’s good practice to dispatch failure action, which in our case is LOAD_USER_FAILURE.

### ***B) Mount Sagas on the store***

```js

// Initialize the saga middleware
const sagaMiddleware = createSagaMiddleware();

// Inject middleware to the store
const store = createStore(userReducer, applyMiddleware(sagaMiddleware));

// Run the sagas you defined. 
// You would normally have a rootSaga were you register all your saga 
// Or spread then in the run function. 
sagaMiddleware.run(watchRequest);
```

To make the store’s state and functions available to the React component, [React-redux](http://redux.js.org/docs/basics/UsageWithReact.html) provides:

1. **connect** function — connects a React component to a Redux store.

1. **Provider component** — a higher order component to make the store available to all container components in the application without passing it explicitly.

### **3) Connect React component to Redux store**

```js
// Dependencies
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put, call, takeLatest } from 'redux-saga/effects';
import { connect, Provider } from 'react-redux';

// GitHub API
const gitHubApi = (username) => {
  // Make API calls here
};

// Action creator
const getUserDetails = (payload) => {
  return {
    type: 'LOAD_USER_REQUEST',
    payload
  }
}

// Reducer
const userReducer = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_USER_SUCCESS':
      return action.user;
    default:
      return state;
  }
};

// Sagas goes here

// UserProfile component
class UserProfile extends React.Component {
  constructor() {
    super();
  }

  componentDidMount() {
    this.props.getUserDetails('rowlandekemezie');
  }

   render() {
    const { user } = this.props;
    return (
      // Render user details here
   )
  }
}

// Store setup goes here
    - - - - 

// Map the store's state to component's props.
const mapStateToProps = (state) => ({
    user: state
}); 

// Wrap action creator with dispatch method. 
// This way getUserDetails is passed in as props.
const mapDispatchToProps = (dispatch) => ({ 
    getUserDetails: (username) => dispatch(getUserDetails(username))
}) 

// React-redux connect function links our React component to Redux store
const UserProfilePage = connect(
    mapStateToProps,
    mapDispatchToProps)(UserProfile);

// Mount our component to the DOM
const element = document.getElementById('root');
ReactDOM.render(
  <Provider store={store}>
    <UserProfilePage />
  </Provider>,
  element, 0
);
```

*let’s test it out …*

https://codepen.io/rowlandekemezie/pen/JKZEVa

## **Wrap up**

AJAX operations in your React application are better handled with Redux async libraries. When using Redux, *don’t put AJAX in your React components.* Separation of concern is key. More so, if your React/redux application requires making async operations, use Redux-thunk or Redux-saga to handle it with agility and elegance. Making async requests within your reducers is an anti-pattern and should be avoided.

Check out the source code on [Github](https://github.com/rowlandekemezie/Redux-saga-tutor.git).


**Note:** This article was originally published on [Codementor](https://www.codementor.io/reactjs/tutorial/handling-ajax-in-your-react-application-with-agility-0).
> In case I missed out on anything, drop your feedback, comments and questions in the comment section. If you find this article useful, recommend it to others by sharing on social media.
