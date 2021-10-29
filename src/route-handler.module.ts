import Config from './config.class';
import { IHandler } from './handler.interface';

// Init ini
Config.init('config.ini');

// Reduce all available sections to a map of hostname => [pattern, handler]
const knownHosts = Config.sections().reduce((acc, curr) => {
  // Get all routes from current section
  // Map their value (endpoint) to a more usable handler-type
  const masks: string[] = [];
  const routes = Config.items(curr).map((it) => {
    const data = it[1].split(':');
    masks.push(it[0]);

    // Create handler entry
    return [it[0], {
      host: data[0],
      port: Number.parseInt(data[1], 10),
      // Is https if it's the first entry, thus false for the second
      https: masks.filter((mask) => mask === it[0]).length === 1,
    }];
  }) as [[string, IHandler]];

  // Create a new entry for each hostname for quick access
  curr.split(',').forEach((hname) => (acc[hname.toLowerCase()] = routes));
  return acc;
}, <{
  [key: string]: [[string, IHandler]],
}>{});

// Subroutine to find a handler for any given path
const findHandler = (hostname: string, path: string, https: boolean): IHandler | null => {
  // No routes known for this hostname
  const knownRoutes = knownHosts[hostname.toLowerCase()];
  if (!knownRoutes)
    return null;

  // Loop all known routes
  for (let i = 0; i < knownRoutes.length; i += 1) {
    const route = knownRoutes[i];

    // Protocol mismatch
    if (route[1].https !== https)
      continue;

    // This pattern doesn't apply to requested path, skip
    if (!new RegExp(route[0]).test(path))
      continue;

    // Take the first matching handler
    return route[1];
  }

  // No handler found!
  return null;
};

export default findHandler;
