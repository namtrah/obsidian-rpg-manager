import {AbstractTemplate} from "../../../abstracts/AbstractTemplate";

export class NonPlayerCharacterTemplate extends AbstractTemplate {
	protected generateFrontmatterTags(
	): string {
		return 'tags: [' + this.app.plugins.getPlugin('rpg-manager').settings.npcTag + '/' + this.campaignId + ']\n';
	}

	protected generateFrontmatterSynopsis(
	): string {
		return 'synopsis: ""\n';
	}

	protected generateFrontmatterGoals(
	): string {
		return 'goals: ""\n';
	}

	protected generateFrontmatterAdditionalInformation(
	): string {
		return 'pronoun: #t/s/h\n';
	}

	protected generateFrontmatterRelationships(
	): string|null {
		return ' characters: \n' +
			' factions: \n' +
		' locations: \n';
	}


	protected generateFrontmatterDates(
	): string|null {
		return ' dob: \n' +
			' death: \n';
	}

	protected generateInitialCodeBlock(
	): string {
		return this.getRpgManagerCodeblock('npc');
	}

	protected generateTemplate(
	): string {
		let response = this.getNotes();
		response += this.getStory();

		return response;
	}
}

