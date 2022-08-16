import {Component, MarkdownPostProcessorContext, MarkdownRenderChild} from "obsidian";
import {Api} from "../api";
import {DataviewInlineApi} from "obsidian-dataview/lib/api/inline-api";
import {RpgViewFactory, viewType} from "../factories/RpgViewFactory";
import {CampaignData, CampaignDataInterface} from "../data/CampaignData";
import {GenericDataInterface, GenericDataListInterface} from "../interfaces/DataInterfaces";
import {IoData} from "../io/IoData";

export abstract class AbstractModel extends MarkdownRenderChild {
	protected dv: DataviewInlineApi;
	protected campaign: CampaignDataInterface|null;
	protected current: Record<string, any>;
	protected io: IoData;

	constructor(
		protected api: Api,
		protected container: HTMLElement,
		private source: string,
		private component: Component | MarkdownPostProcessorContext,
		private sourcePath: string,
	) {
		super(container);
	}

	abstract render(): Promise<void>;

	private async renderComponent(wait = 500){
		setTimeout(() => {
			//@ts-ignore
			this.dv = this.api.app.plugins.plugins.dataview.localApi(this.sourcePath, this.component, this.container);

			const current = this.dv.current();
			if (current != null){
				this.current = current;
			} else {
				return;
			}

			let campaignId: string|null = null;
			if (this.current?.tags != null) {
				this.current.tags.forEach((tag: string) => {
					if (tag.startsWith(this.api.settings.campaignTag)) {
						campaignId = tag.substring(this.api.settings.campaignTag.length + 1);
					} else if (tag.startsWith(this.api.settings.campaignIdentifier)) {
						campaignId = tag.substring(this.api.settings.campaignIdentifier.length + 1);
					}
				});
			}
			if (campaignId !== null){
				const campaigns = this.dv.pages('#' + this.api.settings.campaignTag + '/' + campaignId);

				if (campaigns.length === 1) {
					this.campaign = new CampaignData(
						this.api,
						campaigns[0],
					);
				}
			}

			this.io = new IoData(this.api, this.campaign, this.dv, this.current);
			this.container.innerHTML = '';

			this.render();

			/*
			const frontMatterValidation = MetadataValidator.validate(this.app, this.current);
			if (typeof frontMatterValidation === 'boolean'){
				const campaigns = this.dv.pages("#campaign and " + `-"Templates"`);
				if (campaigns !== undefined && campaigns.length === 1){
					this.campaign = new CampaignData(
						this.api,
						campaigns[0],
					);

				} else {
					this.campaign = null;
				}

				this.io = new IoData(this.api,this.campaign, this.dv, this.current);

				this.container.innerHTML = '';

				this.render();
			} else {
				const error = document.createElement('div');
				error.addClass('rpg-error');

				if (frontMatterValidation === 'Invalid Frontmatter'){
					const heading = document.createElement('h3');
					heading.innerText = frontMatterValidation;
					error.append(heading);
				} else {
					const heading = document.createElement('h3');
					heading.innerText = 'Misconfigured Frontmatter for Rpg Manager';
					error.append(heading);
					error.innerHTML += '<ul>' + frontMatterValidation + '</ul>';
				}

				this.container.innerHTML = error.outerHTML;
			}
			*/
		}, wait);
	}

	onload() {
		this.renderComponent(0);
		this.registerEvent(this.api.app.workspace.on("rpgmanager:refresh-views", this.redrawContainer));
	}

	redrawContainer = () => {
		if (this.isActivePage()) {
			this.renderComponent();
		}
	};

	private isActivePage(): boolean {
		const views = this.api.app.workspace.getLayout().main.children;

		for (let viewCounter = 0; viewCounter < views.length; viewCounter++){
			if (
				views[viewCounter].state?.state?.file !== undefined &&
				views[viewCounter].state?.state?.file === this.sourcePath
			){
				return true;
			}
		}

		return false;
	}

	protected writeList(
		data: GenericDataListInterface,
		typeOfView: viewType,
	): void {
		if (data.elements.length > 0) {
			const view = RpgViewFactory.createList(typeOfView, this.dv);
			view.render(data);
		}
	}

	protected writeData(
		data: GenericDataInterface,
		typeOfView: viewType,
	): void {
		const view = RpgViewFactory.createSingle(typeOfView, this.dv);
		view.render(data);
	}

	protected image(
		width = 75,
		height = 75,
	){
		this.writeData(
			this.io.getImage(width, height),
			viewType.Image,
		)
	}

	protected synopsis(
		title: string|null = null,
	){
		this.writeData(
			this.io.getSynopsis(title),
			viewType.Synopsis,
		)
	}
}
