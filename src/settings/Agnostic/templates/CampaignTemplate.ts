import {AbstractTemplate} from "../../../abstracts/AbstractTemplate";

export class CampaignTemplate extends AbstractTemplate {
    protected generateFrontmatterTags(
	): string {
		return 'tags: [' + this.app.plugins.getPlugin('rpg-manager').settings.campaignTag +'/' + this.campaignId + ']\n';
	}

	protected generateFrontmatterSynopsis(
	): string {
		return 'synopsis: ""\n';
	}

	protected generateFrontmatterAdditionalInformation(
	): string {
		return 'settings: Agnostic\n';
	}

	protected generateFrontmatterDates(
	): string|null {
		let current = '';
		if (this.additionalInformation != null && this.additionalInformation.current != null){
			current = this.additionalInformation.current;
		}
		return ' current: ' + current + '\n';
	}

	protected generateInitialCodeBlock(
	): string {
		const additionalInformation = ' abt: \n' +
			'  need: \n' +
			'  and: \n' +
			'  but: \n' +
			'  therefore: \n';

		return this.getRpgManagerCodeblock('campaignNavigation', additionalInformation);
	}

	protected generateLastCodeBlock(): string {
		return this.getRpgManagerCodeblock('campaign');
	}

	protected generateTemplate(
	): string {
		let response = this.getHeader('Plot');
		response += this.getAbtPlot();

		return response;
	}
}
