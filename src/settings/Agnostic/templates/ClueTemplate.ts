import {AbstractTemplate} from "../../../abstracts/AbstractTemplate";

export class ClueTemplate extends AbstractTemplate {
	protected generateFrontmatterTags(
	): string {
		return 'tags: [' + this.app.plugins.getPlugin('rpg-manager').settings.clueTag + '/' + this.campaignId + ']\n';
	}

	protected generateFrontmatterSynopsis(
	): string {
		return 'synopsis: ""\n';
	}

	protected generateFrontmatterRelationships(
	): string|null {
		return ' characters: \n' +
			' locations: \n';
	}

	protected generateFrontmatterDates(
	): string|null {
		return ' found: \n';
	}

	protected generateInitialCodeBlock(
	): string {
		return this.getRpgManagerCodeblock('clue');
	}

	protected generateTemplate(
	): string {
		const response = this.getAdditionalInformation();

		return response;
	}
}
