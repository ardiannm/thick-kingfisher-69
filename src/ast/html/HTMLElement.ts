import Component from "./Component";

export default class HTMLElement extends Component {
  constructor(public tag: string, public children: Array<Component>) {
    super();
  }
}
