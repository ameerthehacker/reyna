import { hello } from './something';
import { getTodos } from './todo.server';
import { getProduct } from './products.server';

// frontend
getTodos();
getProduct(1);

hello();
