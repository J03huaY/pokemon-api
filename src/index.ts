// Hanfei Yang
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

type Pokemon = {
  id: number
  name: string
  species: string
  health: number
  level: number
  owner: string
}

const pokemon: Pokemon[] = [
  { id: 1, name: 'Pika', species: 'Pikachu', health: 35, level: 5, owner: 'Josh' },
  { id: 2, name: 'Rocket', species: 'Squirtle', health: 50, level: 6, owner: 'James'}
]

app.get('/api/pokemon', (c) => {
  return c.json(pokemon);
})

app.get('/api/pokemon/:id', (c) => {
  const number = Number(c.req.param('id'));
  const found = pokemon.find((p) => p.id === number);

  if (!found) {
    return c.json({ error: 'Pokemon not found' }, 404);
  }
  return c.json(found);
})

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;


app.post('/api/pokemon', async (c) => {
  let body
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid input json'}, 400);
  }

  if (body.id !== undefined) {
    return c.json({ error: 'id must not be provided' }, 400)
  }
  if (body.name !== undefined && typeof body.name !== 'string') {
    return c.json({error: 'invalid name'}, 400);
  }
  if (!body.species || typeof body.species !== 'string') {
    return c.json({ error: 'species is required' }, 400)
  }
  if (!body.owner || typeof body.owner !== 'string') {
    return c.json({ error: 'owner is required' }, 400)
  }

  let newID = randomInt(1, 1000);
  while (pokemon.some((p) => p.id === newID)) {
    newID = randomInt(1, 1000)
  }

  let health = randomInt(10, 200);
  let level = randomInt(1, 100);
  const newPokemon : Pokemon = {
    id: newID,
    name: body.name || body.species,
    species: body. species,
    health: health,
    level: level,
    owner: body.owner
  }
  pokemon.push(newPokemon);
  return c.json(newPokemon, 201);
})

app.patch('/api/pokemon/:id', async (c) => {
  let body
  try {
    body = await c.req.json();
  } catch {
    return c.json({error : 'invalid input json'}, 400);
  }
  let targetID = Number(c.req.param('id'));
  let target = pokemon.find((p) => p.id === targetID);
  if (!target) {
    return c.json({error: 'no such pokemon'}, 404);
  }


  if (body.id !== undefined) {
    return c.json({ error: 'id cannot be changed' }, 400)
  }
  if (body.species !== undefined && (!body.species || typeof body.species !== 'string')) {
    return c.json({ error: 'species must be a non-empty string' }, 400)
  }
  if (body.owner !== undefined && (!body.owner || typeof body.owner !== 'string')) {
    return c.json({ error: 'owner must be a non-empty string' }, 400)
  }
  if (body.name !== undefined && (!body.name || typeof body.name !== 'string')) {
    return c.json({ error: 'name must be a non-empty string' }, 400)
  }
  if (body.health !== undefined && typeof body.health !== 'number') {
    return c.json({ error: 'health must be a number' }, 400)
  }
  if (body.level !== undefined && typeof body.level !== 'number') {
    return c.json({ error: 'level must be a number' }, 400)
  }

  if (body.species !== undefined) target.species = body.species;
  if (body.name !== undefined) target.name = body.name;
  if (body.owner !== undefined) target.owner = body.owner;
  if (body.health !== undefined) target.health = body.health;
  if (body.level !== undefined) target.level = body.level;

  return c.json(target);
})

app.delete('/api/pokemon/:id', async(c) => {
  let targetID = Number(c.req.param('id'));
  let target = pokemon.find((p) => p.id === targetID);
  if (!target) {
    return c.json({error: 'no such pokemon'}, 404);
  }

  let index = pokemon.indexOf(target);
  const deleted = pokemon.splice(index, 1);
  return c.json(deleted);
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
