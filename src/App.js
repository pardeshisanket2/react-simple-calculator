import { useReducer } from 'react';
import DigitButton from './components/UI/DigitButton';
import OperationButton from './components/UI/OperationButton';
import './styles.css';

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate',
};

// Reducer function allows us to manage all of our state for us
// Reducer that takes two arguments state and action
// We break down action into to type & payload
const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // If there is some calculation done with a result, overwrite the result with new digit inputs
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }
      // Stops adding more zero on the left side of the string
      if (payload.digit === '0' && state.currentOperand === '0') {
        return state;
      }
      // Only able to add one decimal point
      if (payload.digit === '.' && state.currentOperand.includes('.')) {
        return state;
      }
      // Actually adds digits to the string if not null
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`,
      };
    case ACTIONS.CHOOSE_OPERATION:
      // Both are empty then do nothing
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }

      // To switch between different operations
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }
      // Moves currentOperand into previousOperand and set the operation
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      // If we have both previous & currentOperand then perform evaluation
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    // Clears everything
    case ACTIONS.CLEAR:
      return {};

    case ACTIONS.DELETE_DIGIT:
      // If we are in the overwrite state then we want to delete the currentOperand
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      // If string is empty
      if (state.currentOperand == null) return state;
      // If string has only one digit, clear the currentOperand instead of leaving a empty string ""
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }
      // the default delete state. This will remove the last digit from current operand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };
    case ACTIONS.EVALUATE:
      // Any of these 3 are null, then there is no point in evaluation (=)
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }

      // If everything is correct, then perform evaluation(=)
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
};

// Performs Evaluation using all 4 operations
const evaluate = ({ currentOperand, previousOperand, operation }) => {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(current)) return '';
  let computation = '';
  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '÷':
      computation = prev / current;
      break;
    case '*':
      computation = prev * current;
      break;
  }

  return computation.toString();
};

// Formats integers for us eg. 1,234
const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0,
});

// Actually performs the formatting
const formatOperand = (operand) => {
  if (operand == null) return;
  // Split the integer & decimal as we dont want to format decimals
  const [integer, decimal] = operand.split('.');
  // If no decimal, format the integers
  if (decimal == null) return INTEGER_FORMATTER.format(integer);
  // If decimal, then just concat it to the end of the integer with a '.' between them
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
};

const App = () => {
  // useReducer hook with state and dispatch
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  );

  return (
    <div className='calculator-grid'>
      <div className='output'>
        <div className='previous-operand'>
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className='current-operand'>{formatOperand(currentOperand)}</div>
      </div>
      <button
        className='span-two'
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <OperationButton operation='÷' dispatch={dispatch} />
      <DigitButton digit='1' dispatch={dispatch} />
      <DigitButton digit='2' dispatch={dispatch} />
      <DigitButton digit='3' dispatch={dispatch} />
      <OperationButton operation='*' dispatch={dispatch} />
      <DigitButton digit='4' dispatch={dispatch} />
      <DigitButton digit='5' dispatch={dispatch} />
      <DigitButton digit='6' dispatch={dispatch} />
      <OperationButton operation='+' dispatch={dispatch} />
      <DigitButton digit='7' dispatch={dispatch} />
      <DigitButton digit='8' dispatch={dispatch} />
      <DigitButton digit='9' dispatch={dispatch} />
      <OperationButton operation='-' dispatch={dispatch} />
      <DigitButton digit='.' dispatch={dispatch} />
      <DigitButton digit='0' dispatch={dispatch} />
      <button
        className='span-two'
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>
        =
      </button>
    </div>
  );
};

export default App;
