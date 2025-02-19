import {AbstractComponent} from "../../../abstracts/AbstractComponent";
import {ResponseElementInterface} from "../../../interfaces/response/ResponseElementInterface";
import {ResponseHeader} from "../../../data/responses/ResponseHeader";
import {ContentType} from "../../../enums/ContentType";
import {RpgDataInterface} from "../../../interfaces/data/RpgDataInterface";
import {Character} from "../data/Character";
import {Clue} from "../data/Clue";
import {Location} from "../data/Location";
import {Event} from "../data/Event";
import {Scene} from "../data/Scene";
import {ResponseHeaderElement} from "../../../data/responses/ResponseHeaderElement";
import {HeaderResponseType} from "../../../enums/HeaderResponseType";

export class HeaderComponent extends AbstractComponent{
	generateData(
		data: RpgDataInterface,
		title: string | null,
		additionalInformation: any|null = null,
	): ResponseElementInterface | null {
		const response = new ResponseHeader(this.app);

		response.link = this.app.plugins.getPlugin('rpg-manager').factories.contents.create(data.link, ContentType.Link);
		response.name = data.name;

		let synopsis = '<span class="rpgm-missing">Synopsis missing</span>';
		let synopsisTitle = 'Synopsis';

		if (data instanceof Character) {
			if (data.synopsis != null && data.synopsis !== '') {
				synopsis = '';
				synopsis += data.link.toString();
				const pronoun = data.pronoun;
				if (pronoun != null) {
					synopsis += this.app.plugins.getPlugin('rpg-manager').factories.pronouns.readPronoun(pronoun);
				}
				synopsis += (data.isDead) ? ' was ' : ' is ';
				synopsis += data.synopsis;
			}
			response.addElement(new ResponseHeaderElement(this.app, 'Synopsis', synopsis, HeaderResponseType.Long));

			if (data.goals != null) response.addElement(new ResponseHeaderElement(this.app, 'Goals', data.goals.toString(), HeaderResponseType.Long));

			if (data.pronoun != null) response.addElement(new ResponseHeaderElement(this.app, 'Pronoun', this.app.plugins.getPlugin('rpg-manager').factories.pronouns.readPronoun(data.pronoun), HeaderResponseType.Short));
			if (data.age != null || data.death != null) {
				response.addElement(new ResponseHeaderElement(this.app, 'Status', data.death ? 'Dead' : 'Alive', HeaderResponseType.Short));
			}
			if (data.death != null){
				let death = data.death.toDateString();
				if (data.age != null){
					death += ' at age ' + data.age;
				}
				response.addElement(new ResponseHeaderElement(this.app, 'Death', death, HeaderResponseType.Short));
			} else if (data.age != null) {
				response.addElement(new ResponseHeaderElement(this.app, 'Age', data.age.toString(), HeaderResponseType.Short));			}

		} else {
			if (data instanceof Scene) {
				synopsisTitle = 'Scene Goal';
			}

			if (data instanceof Clue){
				const clueFound = data.isFound
					? 'Clue found on ' + data.found?.toDateString()
					: '<span class="rpgm-missing">Clue not found yet</span>';

				response.addElement(new ResponseHeaderElement(this.app, 'Found', clueFound, HeaderResponseType.Short));
			} else if (data instanceof Location){
				if (data.address != null && data.address != ''){
					response.addElement(new ResponseHeaderElement(this.app, 'Address', data.address, HeaderResponseType.Short));
				}
			} else if (data instanceof Event){
				if (data.date != null) {
					response.addElement(new ResponseHeaderElement(this.app, 'Date', data.date.toDateString(), HeaderResponseType.Short));
				}
			} else if (data instanceof Scene){
				if (data.action != null && data.action != ''){
					response.addElement(new ResponseHeaderElement(this.app, 'Action', data.action, HeaderResponseType.Long));
				} else if (additionalInformation != null && additionalInformation.action != null && additionalInformation.action != ''){
					response.addElement(new ResponseHeaderElement(this.app, 'Action', additionalInformation.action, HeaderResponseType.Long));
				}

				if (additionalInformation != null && additionalInformation.trigger != null && additionalInformation.trigger != ''){
					response.addElement(new ResponseHeaderElement(this.app, 'Trigger', additionalInformation.trigger, HeaderResponseType.Long));
				}
			}

			if (data.synopsis != null && data.synopsis != '') {
				synopsis = data.synopsis;
			}
			response.addElement(new ResponseHeaderElement(this.app, synopsisTitle, synopsis, HeaderResponseType.Long));
		}

		response.imgSrc = data.image;
		response.imgWidth = 300;
		response.imgHeight = 300;



		return response;
	}
}
