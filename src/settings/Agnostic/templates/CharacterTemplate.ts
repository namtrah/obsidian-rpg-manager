import {AbstractTemplate} from "../../../abstracts/AbstractTemplate";

export class CharacterTemplate extends AbstractTemplate {

	protected generateFrontmatterTags(
	): string {
		return 'tags: [' + this.app.plugins.getPlugin('rpg-manager').settings.pcTag + '/' + this.campaignId + ']\n';
	}

	protected generateFrontmatterRelationships(
	): string|null {
		return ' characters: \n' +
			' factions: \n' +
			' locations: \n';
	}

	protected generateInitialCodeBlock(
	): string {
		return this.getRpgManagerCodeblock('pc');
	}

	protected generateFrontmatterDates(
	): string|null {
		return ' dob: \n' +
			' death: \n';
	}

	protected generateFrontmatterAdditionalInformation(
	): string {
		return 'pronoun: #t/s/h\n';
	}

	protected generateTemplate(
	): string {
		const response = this.getPlayerCharacterDetails();

		return response;
	}
}
