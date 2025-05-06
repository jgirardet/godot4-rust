export { Tscn, Nodei, Heading, Instance, ExtResource, RHeading };

interface Tscn {
  entities: [Nodei];
}
interface Nodei {
  heading: Heading | RHeading;
  type: string;
}
interface Heading {
  type?: string;
  instance?: Instance;
  parent: string;
  name: string;
}

interface Instance {
  params: string[];
}

interface ExtResource {
  heading: RHeading;
}

interface RHeading {
  type: string;
  path: string;
  id: string;
}
