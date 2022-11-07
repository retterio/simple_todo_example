import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk"
import { RemoveTodoModel, UpsertTodoModel } from "./rio"

const rdk = new RDK()

export async function authorizer(data: Data): Promise<Response> {
  return { statusCode: 200 }
}

export async function init(data: Data): Promise<InitResponse> {
  return { state: { public: { todos: [] } } }
}

export async function getState(data: Data): Promise<Response> {
  return { statusCode: 200, body: data.state }
}

export async function UpsertTodo(data: Data<UpsertTodoModel>): Promise<StepResponse> {
  try {
    const { todo, id } = data.request.body; // autocompleted
    const { todos } = data.state.public // autocompleted

    const new_id = id ? id : Date.now()

    const index = todos.findIndex((_todo) => _todo.id === new_id)

    if (index === -1) {
      todos.push({ id: new_id, todo })
    } else {
      todos[index] = { id: new_id, todo }
    }

    data.response = {
      statusCode: 200,
      body: { success: true, newTodo: { todo, id: new_id } },
    }
  } catch (error) {
    data.response = {
      statusCode: 406,
      body: { success: false, error: error },
    }
  }

  return data
}

export async function RemoveTodo(data: Data<RemoveTodoModel>): Promise<StepResponse> {
  try {
    const { id } = data.request.body; 
    let { todos } = data.state.public

    const index = todos.findIndex((_todo) => _todo.id === id)
    if (index === -1) throw new Error("Todo does not exist.");

    data.state.public.todos = todos.filter(_todo => _todo.id !== id)

    data.response = {
      statusCode: 200,
      body: { success: true, message: `Todo with id: ${id} successfully removed`},
    }
  } catch (error) {
    data.response = {
      statusCode: 406,
      body: { success: false, error: error },
    }
  }

  return data
}

export async function GetTodos(data: Data): Promise<StepResponse> {
  try {
    data.response = {
      statusCode: 200,
      body: { success: true, todos: data.state.public.todos },
    }
  } catch (error) {
    data.response = {
      statusCode: 406,
      body: { success: false, error: error },
    }
  }

  return data
}