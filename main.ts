import { App, ItemView, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';

const VIEW_TYPE_TAG_CLOUD = 'tag-cloud-view';

interface TagCloudSettings {
	minFontSize: number;
	maxFontSize: number;
	colorScheme: string;
	daysBack: number;
	minOccurrences: number;
}

const DEFAULT_SETTINGS: TagCloudSettings = {
	minFontSize: 12,
	maxFontSize: 36,
	colorScheme: 'default',
	daysBack: 7,
	minOccurrences: 5
}

export default class TagCloudPlugin extends Plugin {
	settings: TagCloudSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_TAG_CLOUD,
			(leaf) => new TagCloudView(leaf, this)
		);

		this.addRibbonIcon('tag', 'When Dear?', () => {
			this.activateView();
		});

		this.addCommand({
			id: 'open-when-dear',
			name: 'Open When Dear?',
			callback: () => {
				this.activateView();
			}
		});

		this.addSettingTab(new WhenDearSettingTab(this.app, this));
	}

	async activateView() {
		const { workspace } = this.app;
		
		let leaf: WorkspaceLeaf;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TAG_CLOUD);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_TAG_CLOUD, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TagCloudView extends ItemView {
	private readonly tags: Map<string, number> = new Map();
	private plugin: TagCloudPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: TagCloudPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_TAG_CLOUD;
	}

	getDisplayText() {
		return 'When Dear?';
	}

	getIcon() {
		return 'tag';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('tag-cloud-container');

		this.renderControls(container);
		await this.collectTags();
		this.renderTagCloud(container);
	}

	private async collectTags() {
		this.tags.clear();
		const files = this.app.vault.getMarkdownFiles();
		const daysBack = this.plugin.settings.daysBack;
		const cutoffDate = daysBack > 0 ? new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000)) : null;

		for (const file of files) {
			// Skip files older than the cutoff date if a filter is set
			if (cutoffDate && file.stat.mtime < cutoffDate.getTime()) {
				continue;
			}

			const cache = this.app.metadataCache.getFileCache(file);
			if (cache?.tags) {
				for (const tag of cache.tags) {
					const tagName = tag.tag.slice(1);
					this.tags.set(tagName, (this.tags.get(tagName) ?? 0) + 1);
				}
			}
		}
	}

	private renderControls(container: Element) {
		const controlsEl = container.createEl('div', { cls: 'when-dear-controls' });
		
		const labelEl = controlsEl.createEl('span', { 
			text: 'Days back:',
			cls: 'when-dear-label'
		});

		const sliderEl = controlsEl.createEl('input', { 
			type: 'range',
			cls: 'when-dear-slider'
		});
		sliderEl.min = '0';
		sliderEl.max = '365';
		sliderEl.value = this.plugin.settings.daysBack.toString();

		const valueEl = controlsEl.createEl('span', { 
			text: this.plugin.settings.daysBack === 0 ? 'All' : this.plugin.settings.daysBack.toString(),
			cls: 'when-dear-value'
		});

		sliderEl.addEventListener('input', async (e) => {
			const value = parseInt((e.target as HTMLInputElement).value);
			this.plugin.settings.daysBack = value;
			await this.plugin.saveSettings();
			
			valueEl.textContent = value === 0 ? 'All' : value.toString();
			
			// Refresh the tag cloud
			await this.collectTags();
			const existingCloud = container.querySelector('.tag-cloud-content');
			if (existingCloud) {
				existingCloud.remove();
			}
			this.renderTagCloud(container);
		});
	}

	private renderTagCloud(container: Element) {
		const daysBack = this.plugin.settings.daysBack;
		const minOccurrences = this.plugin.settings.minOccurrences;
		const timeframeText = daysBack > 0 ? ` (last ${daysBack} days)` : '';
		
		const cloudContentEl = container.createEl('div', { cls: 'tag-cloud-content' });
		
		// Filter tags by minimum occurrences
		const filteredTags = Array.from(this.tags.entries()).filter(([_, count]) => count >= minOccurrences);
		
		if (filteredTags.length === 0) {
			const message = this.tags.size === 0 
				? `No tags found in your vault${timeframeText}.`
				: `No tags with ${minOccurrences}+ occurrences found${timeframeText}.`;
			cloudContentEl.createEl('div', { text: message });
			return;
		}

		const counts = filteredTags.map(([_, count]) => count);
		const maxCount = Math.max(...counts);
		const minCount = Math.min(...counts);
		const countRange = maxCount - minCount || 1;

		const cloudEl = cloudContentEl.createEl('div', { cls: 'tag-cloud' });
		const { minFontSize, maxFontSize } = this.plugin.settings;
		const fontRange = maxFontSize - minFontSize;

		filteredTags
			.sort(([a], [b]) => a.localeCompare(b))
			.forEach(([tag, count]) => {
				const weight = (count - minCount) / countRange;
				const fontSize = minFontSize + (weight * fontRange);
				const opacity = 0.5 + (weight * 0.5);

				const tagEl = cloudEl.createEl('span', {
					text: tag,
					cls: 'tag-cloud-item'
				});

				tagEl.style.fontSize = `${fontSize}px`;
				tagEl.style.opacity = opacity.toString();
				tagEl.style.margin = '2px 4px';
				tagEl.style.cursor = 'pointer';
				tagEl.style.display = 'inline-block';
				tagEl.title = `${count} occurrence${count === 1 ? '' : 's'}`;

				tagEl.addEventListener('click', () => {
					this.app.workspace.openLinkText(`#${tag}`, '', false);
				});
			});
	}

	async onClose() {
		
	}
}

class WhenDearSettingTab extends PluginSettingTab {
	plugin: TagCloudPlugin;

	constructor(app: App, plugin: TagCloudPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Days back')
			.setDesc('Number of days in the past to collect tags from (0 for all time)')
			.addSlider(slider => slider
				.setLimits(0, 365, 1)
				.setValue(this.plugin.settings.daysBack)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.daysBack = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Minimum font size')
			.setDesc('Smallest font size for tags')
			.addSlider(slider => slider
				.setLimits(8, 24, 1)
				.setValue(this.plugin.settings.minFontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.minFontSize = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Maximum font size')
			.setDesc('Largest font size for tags')
			.addSlider(slider => slider
				.setLimits(24, 60, 1)
				.setValue(this.plugin.settings.maxFontSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxFontSize = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Minimum occurrences')
			.setDesc('Minimum number of times a tag must appear to be included in the cloud')
			.addSlider(slider => slider
				.setLimits(1, 20, 1)
				.setValue(this.plugin.settings.minOccurrences)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.minOccurrences = value;
					await this.plugin.saveSettings();
				}));
	}
}
