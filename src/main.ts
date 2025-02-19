import {App, Component, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting,} from 'obsidian';
import {RpgController} from "./RpgController";
import {DataType} from "./enums/DataType";
import {RpgData} from "./data/RpgData";
import {RpgFunctions} from "./RpgFunctions";
import {RpgFactories} from "./RpgFactories";
import {CreationModal} from "./modals/CreationModal";
import {TagManager} from "./helpers/TagManager";

export default class RpgManager extends Plugin {
	/*
	@TODO: Add additional information to modal windows and to template
	@TODO: RAW
		- Update RAW Ability stats remotely
		- POST /Characters
		- PATCH /Characters
		- Generate Character
	 */
	settings: RpgManagerSettings;
	functions: RpgFunctions;
	io: RpgData;
	factories: RpgFactories;
	tagManager: TagManager;

	async onload() {
		console.log('Loading RpgManager ' + this.manifest.version);

		await this.loadSettings();

		this.addSettingTab(new RpgManagerSettingTab(this.app, this));
		app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

		this.io = new RpgData(this.app);
		this.functions = new RpgFunctions(this.app);
		this.factories = new RpgFactories(this.app);
		this.tagManager = new TagManager(this.app);

		this.registerEvents();
		this.registerCodeBlock();
		this.registerCommands();
	}

	async onLayoutReady(){
		this.io.loadCache();
	}

	async onunload() {
		super.onunload();

		this.app.workspace.off('resolved', this.refreshViews);
		this.app.workspace.off('modify', this.refreshViews);
	}

	refreshViews(){
		this.app.workspace.trigger("rpgmanager:refresh-views");
	}

	public async createRpgView(
		source: string,
		el: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		sourcePath: string
	) {
		component.addChild(
			new RpgController(
				this.app,
				el,
				source,
				component,
				sourcePath,
			)
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async updateSettings(settings: Partial<RpgManagerSettings>) {
		Object.assign(this.settings, settings);
		await this.saveData(this.settings);
	}

	private registerEvents(
	) : void {

		this.registerEvent(this.app.metadataCache.on('resolved', this.refreshViews.bind(this)));
		this.registerEvent(this.app.workspace.on('file-open', this.refreshViews.bind(this)));
	}

	private registerCodeBlock(
	): void {
		this.registerMarkdownCodeBlockProcessor('RpgManager', async (source: string, el, ctx) =>
			this.createRpgView(source, el, ctx, ctx.sourcePath)
		);
	}

	private registerCommands(
	): void {
		Object.keys(DataType).filter((v) => isNaN(Number(v))).forEach((type, index) => {
			this.addCommand({
				id: "rpg-manager-create-" + type.toLowerCase(),
				name: "Create a new " + type,
				callback: () => {
					new CreationModal(
						this.app,
						DataType[type as keyof typeof DataType],
					).open();
				},
			});
			this.addCommand({
				id: "rpg-manager-fill-" + type.toLowerCase(),
				name: "Fill with " + type,
				callback: () => {
					let name: string|null = null;
					const activeFile = app.workspace.getActiveFile();
					if (activeFile != null) {
						name = activeFile.basename;
					}
					new CreationModal(
						this.app,
						DataType[type as keyof typeof DataType],
						false,
						name,
					).open();
				},
			});
		})
	}
}

export interface RpgManagerSettings {
	campaignTag: string;
	adventureTag: string;
	sessionTag: string;
	sceneTag: string;
	npcTag: string;
	pcTag: string;
	locationTag: string;
	factionTag: string;
	eventTag: string;
	clueTag: string;
	timelineTag: string;
	noteTag: string;
	automaticMove: boolean;
}

export const DEFAULT_SETTINGS: RpgManagerSettings = {
	campaignTag: 'rpgm/outline/campaign',
	adventureTag: 'rpgm/outline/adventure',
	sessionTag: 'rpgm/outline/session',
	sceneTag: 'rpgm/outline/scene',
	npcTag: 'rpgm/element/character/npc',
	pcTag: 'rpgm/element/character/pc',
	locationTag: 'rpgm/element/location',
	factionTag: 'rpgm/element/faction',
	eventTag: 'rpgm/element/event',
	clueTag: 'rpgm/element/clue',
	timelineTag: 'rpgm/element/timeline',
	noteTag: 'rpgm/outline/note',
	automaticMove: true,
}

export class RpgManagerSettingTab extends PluginSettingTab {
	plugin: RpgManager;

	constructor(app: App, plugin: RpgManager) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'CampaignSetting for Role Playing Game Manager'});

		containerEl.createEl('h3', {text: 'Automations'});
		containerEl.createEl('span', {text: createFragment(frag => {
				frag.appendText('Set your preferences for the automations RPG Manager offers.');
				frag.createEl('br');
				frag.appendText(' ');
			})});

		new Setting(this.containerEl)
			.setName("Auto Organisation of Notes")
			.setDesc(createFragment(frag => {
				frag.createEl('br');
				frag.appendText('RPG Manager automatically organise created or filled outlines and elements in separate folders.');
				frag.createEl('br');
				frag.appendText('You can avoid the automatical move of your notes by disabling this setting.');
				frag.createEl('br');
				frag.appendText(' ');
			}))
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.automaticMove)
					.onChange(async value => await this.plugin.updateSettings({ automaticMove: value }))
			);

		containerEl.createEl('h3', {text: 'Outlines'});
		containerEl.createEl('span', {text: createFragment(frag => {
				frag.appendText('Outlines are the plot part of the campaign.');
				frag.createEl('br');
				frag.appendText('The outlines are organised as campaigns > adventures > sessions > scenes');
				frag.createEl('br');
				frag.appendText('Each tag that identifies an outline should be followed by the ids of the parent outlines and end with a unique identifier for the current outline');
				frag.createEl('br');
				frag.createEl('span');
				frag.appendText(' ');
			})});

		new Setting(this.containerEl)
			.setName("Campaign Outline Tag")
			.setDesc(createFragment(frag => {
				frag.appendText('The tag identifying the campaign');
				frag.createEl('br');
				frag.appendText('Required ids:');
				frag.createEl('br');
				frag.appendText('/{campaignId}');
			}))
			.addText(text =>
				text
					.setPlaceholder('rpgm/outline/campaign')
					.setValue(this.plugin.settings.campaignTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ campaignTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Adventure Outline Tag")
			.setDesc(createFragment(frag => {
				frag.appendText('The tag identifying an Adventure');
				frag.createEl('br');
				frag.appendText('Required ids:');
				frag.createEl('br');
				frag.appendText('/{campaignId}/{adventureId}');
			}))
			.addText(text =>
				text
					.setPlaceholder('rpgm/outline/adventure')
					.setValue(this.plugin.settings.adventureTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ adventureTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Session Outline Tag")
			.setDesc(createFragment(frag => {
				frag.appendText('The tag identifying a Session');
				frag.createEl('br');
				frag.appendText('Required ids:');
				frag.createEl('br');
				frag.appendText('/{campaignId}/{adventureId}/{sessionId}');
			}))
			.addText(text =>
				text
					.setPlaceholder('rpgm/outline/session')
					.setValue(this.plugin.settings.sessionTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ sessionTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Scenes Outline Tag")
			.setDesc(createFragment(frag => {
				frag.appendText('The tag identifying a Scene');
				frag.createEl('br');
				frag.appendText('Required ids:');
				frag.createEl('br');
				frag.appendText('/{campaignId}/{adventureId}/{sessionId}/{sceneId}');
			}))
			.addText(text =>
				text
					.setPlaceholder('rpgm/outline/scene')
					.setValue(this.plugin.settings.sceneTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ sceneTag: value });
					})
			);

		containerEl.createEl('h3', {text: 'Elements'});
		containerEl.createEl('span', {text: createFragment(frag => {
				frag.appendText('Elements are all the parts of the campaign which are not a plot.');
				frag.createEl('br');
				frag.appendText('The elements do not have a hyerarchical structure, but they only identify the campaign they belong to.');
				frag.createEl('br');
				frag.appendText('Each tag that identifies an element should be followed by the {campaignId}');
				frag.createEl('br');
				frag.appendText(' ');
			})});

		new Setting(this.containerEl)
			.setName("Player Character Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/character/pc')
					.setValue(this.plugin.settings.pcTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ pcTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Non Player Character Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/character/npc')
					.setValue(this.plugin.settings.npcTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ npcTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Location Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/location')
					.setValue(this.plugin.settings.locationTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ locationTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Faction Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/faction')
					.setValue(this.plugin.settings.factionTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ factionTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Event Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/event')
					.setValue(this.plugin.settings.eventTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ eventTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Clue Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/clue')
					.setValue(this.plugin.settings.clueTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ clueTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Timeline Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/timeline')
					.setValue(this.plugin.settings.timelineTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ timelineTag: value });
					})
			);

		new Setting(this.containerEl)
			.setName("Note Tag")
			.addText(text =>
				text
					.setPlaceholder('rpgm/element/note')
					.setValue(this.plugin.settings.noteTag)
					.onChange(async value => {
						if (value.length == 0) return;
						await this.plugin.updateSettings({ noteTag: value });
					})
			);
	}
}
