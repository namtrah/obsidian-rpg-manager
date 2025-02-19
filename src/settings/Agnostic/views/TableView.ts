import {TableResponseInterface} from "../../../interfaces/response/TableResponseInterface";
import {ContentInterface} from "../../../interfaces/ContentInterface";
import {AbstractView} from "../../../abstracts/AbstractView";

export class TableView extends AbstractView {
	public render(
		container: HTMLElement,
		data: TableResponseInterface,
	): void {
		const divContainer = container.createDiv();
		if (data.title != null) {
			divContainer.createEl('h2', {text: data.title});
		}

		const table = divContainer.createEl('table');
		table.addClass('rpgm-table');

		if (data.class != null){
			table.addClass(data.class);
		}

		if (data.headers != null && data.headers.length > 0) {
			const header = table.createEl('tr');
			data.headers.forEach((content: ContentInterface) => {
				const cell = header.createEl('th');
				content.fillContent(cell, this.sourcePath);
				if (content.isInLine) {
					cell.addClass('inline');
				}
			});
		}

		data.content.forEach((element: Array<ContentInterface>) => {
			const row = table.createEl('tr');
			element.forEach((content: ContentInterface) => {
				const cell = row.createEl('td');
				content.fillContent(cell, this.sourcePath);

				if (content.isInLine){
					cell.addClass('inline');
				}
			});
		});
	}
}
