import Component from "./Component";

export default class HTMLElement extends Component {
  constructor(public selector: string, public children: Array<Component>) {
    super();
  }
}
