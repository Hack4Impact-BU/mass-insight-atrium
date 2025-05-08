import { configureStore, Middleware, AnyAction, Store } from "@reduxjs/toolkit";
import eventCreateFormReducer from "./features/eventCreateForm/eventCreateFormSlice";
import masterTableReducer from "./features/masterTableSlice";
import { createLogger } from 'redux-logger';
import { useDispatch, useSelector } from 'react-redux';
import { TypedUseSelectorHook } from 'react-redux';

// Custom middleware for handling async actions with debouncing
const asyncMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  if (typeof action === 'object' && action !== null && 'type' in action && typeof action.type === 'string') {
    const actionType = action.type;
    
    // Debounce loading state changes to prevent rapid UI updates
    if (actionType.endsWith('/pending')) {
      const currentState = store.getState();
      if (!currentState.loading) {
        store.dispatch({ type: 'SET_LOADING', payload: true });
      }
    } else if (actionType.endsWith('/fulfilled') || actionType.endsWith('/rejected')) {
      const currentState = store.getState();
      if (currentState.loading) {
        store.dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }
  return next(action);
};

// Optimized logger middleware for development
const logger = createLogger({
  collapsed: true,
  diff: true,
  predicate: (_, action) => {
    // Only log actions that modify state
    return !action.type.startsWith('SET_LOADING');
  },
  stateTransformer: (state) => {
    // Only include relevant parts of the state in logs
    const { eventCreateForm } = state;
    return {
      eventCreateForm: {
        ...eventCreateForm,
        // Exclude large arrays from logs
        attendees: eventCreateForm.attendees?.length,
        moderators: eventCreateForm.moderators?.length,
      },
    };
  },
});

// Memoized store creation
let store: Store | undefined;

export const makeStore = (): Store => {
  if (store) return store;

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  store = configureStore({
    reducer: {
      eventCreateForm: eventCreateFormReducer,
      masterTable: masterTableReducer,
    },
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['SET_LOADING'],
          // Ignore these field paths in all actions
          ignoredActionPaths: ['payload.timestamp'],
          // Ignore these paths in the state
          ignoredPaths: ['eventCreateForm.lastSaved'],
        },
        immutableCheck: {
          // Ignore these paths in the state
          ignoredPaths: ['eventCreateForm.validationErrors'],
        },
      }).concat(asyncMiddleware);
      
      if (isDevelopment) {
        middleware.push(logger);
      }
      
      return middleware;
    },
    devTools: isDevelopment,
  });

  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Memoized hooks for better performance
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useAppDispatch, useAppSelector };
