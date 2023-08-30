const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa-cors');
const { v4: uuid } = require('uuid');
const app = new Koa();

const appData = {
  tickets: [
    {
      id: 1,
      name: 'Ticket 1',
      status: false,
      created: new Date('2023-08-23').getTime(),
      description: 'No description',
    },
  ],
};

app.use(cors());

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
  })
);

const getStatus404 = () => {
  return { status: 404 };
};

const getFullTicket = (id) => {
  return appData.tickets.find((tckt) => tckt.id == id);
};

const createTicket = ({ name, description, status }) => {
  try {
    const id = uuid();
    const created = new Date().getTime();
    const ticket = { id, name, status, created, description };
    appData.tickets.push(ticket);
    return ticket;
  } catch (err) {
    return err.message;
  }
};

const deleteTicket = (id) => {
  try {
    appData.tickets = appData.tickets.filter((ticket) => ticket.id !== id);
    return { status: true, id };
  } catch (err) {
    return err.message;
  }
};

const editTicket = ({ id, name, description, status }) => {
  try {
    const changedTicked = getFullTicket(id);

    if (status !== undefined) changedTicked.status = status;
    if (name !== undefined) changedTicked.name = name;
    if (description !== undefined) changedTicked.description = description;

    return changedTicked;
  } catch (err) {
    return err.message;
  }
};

const handleGet = (ctx) => {
  const { method, id } = ctx.request.query;

  switch (method) {
    case 'allTickets':
      ctx.response.body = appData.tickets;
      return;
    case 'ticketById':
      ctx.response.body = getFullTicket(id);
      return;
    default:
      ctx.response.body = getStatus404();
      return;
  }
};

const handlePost = (ctx) => {
  const { id, method } = ctx.request.body;

  switch (method) {
    case 'createTicket':
      ctx.response.body = createTicket(ctx.request.body);
      return;
    case 'editTicket':
      ctx.response.body = editTicket(ctx.request.body);
      return;
    case 'deleteTicket':
      ctx.response.body = deleteTicket(id);
      return;
    default:
      ctx.response.body = getStatus404();
      return;
  }
};

app.use(async (ctx) => {
  if (ctx.method === 'GET') {
    handleGet(ctx);
  } else if (ctx.method === 'POST') {
    handlePost(ctx);
  }
});

const server = http.createServer(app.callback()).listen(8080);
