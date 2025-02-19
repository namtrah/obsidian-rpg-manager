import {AbstractComponent} from "../../../abstracts/AbstractComponent";
import {ResponseElementInterface} from "../../../interfaces/response/ResponseElementInterface";
import {ResponseLine} from "../../../data/responses/ResponseLine";
import {ContentType} from "../../../enums/ContentType";
import {CharacterInterface} from "../../../interfaces/data/CharacterInterface";

export class CharacterSynopsisComponent extends AbstractComponent{
	generateData(
		data: CharacterInterface,
		title: string | null,
	): ResponseElementInterface | null {
		let fullSynopsis = '<span class="rpgm-missing">Synopsis missing</span>';

		if (data.synopsis != null && data.synopsis !== '') {
			fullSynopsis = '';
			if (data.isDead) {
				fullSynopsis = '_Deceased ' + data.death?.toDateString() + '_\n';
			}
			fullSynopsis += data.link.toString();
			const pronoun = data.pronoun;
			if (pronoun != null) {
				fullSynopsis += this.app.plugins.getPlugin('rpg-manager').factories.pronouns.readPronoun(pronoun);
			}
			fullSynopsis += (data.isDead) ? ' was ' : ' is ';
			fullSynopsis += data.synopsis;
		}

		const response = new ResponseLine(this.app);
		response.content =this.app.plugins.getPlugin('rpg-manager').factories.contents.create(
			fullSynopsis,
			ContentType.Markdown,
		);

		return response;
	}
}
