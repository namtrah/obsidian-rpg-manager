import {ResponseElementInterface} from "./response/ResponseElementInterface";
import {RpgDataInterface} from "./data/RpgDataInterface";

export interface ComponentInterface {
	generateData(
		data: RpgDataInterface[]|RpgDataInterface,
		title: string|null,
		additionalInformation: any|null,
	): ResponseElementInterface|null;
}
