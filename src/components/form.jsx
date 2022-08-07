import React, { useState, useRef } from "react";
import debounce from "debounce-promise";
import {
	Button,
	IconButton,
	InputAdornment,
	LinearProgress,
	TextField,
	Tooltip,
	Paper,
} from "@mui/material";
import {
	Clear as ClearIcon,
	ContentCopy as ContentCopyIcon,
	ErrorOutline as ErrorOutlineIcon,
	SwapVert as SwapVertIcon,
	FeedbackOutlined as FeedbackOutlinedIcon,
} from "@mui/icons-material";
import { useTranslation } from 'react-i18next';

import {
	getHistory,
	saveHistory,
} from "../history";
import { translate } from "../api";
import ASR from "./asr";
import { TranslationHistory } from "./TranslationHistory";
import { transliterateCyrilToLatin, transliterateLatinToCyril } from "../transliterate";

import ukraineFlag from "../../public/static/img/ukraine.png";
import czechFlag from "../../public/static/img/czech-republic.png";

import styles from "./form.module.scss"


const debouncedTranslate = debounce(translate, 500);
const debouncedSave = debounce(saveHistory, 3000);

const languageUk = {
	id: "uk",
	name: "Українською",
	transliterate: transliterateCyrilToLatin,
	flag: ukraineFlag,
};

const languageCs = {
	id: "cs",
	name: "Česky",
	transliterate: transliterateLatinToCyril,
	flag: czechFlag,
};

let loadingID = 0; // id of most recent sent request
let loadedID = 0;  // id o most recent received request


const Form = () => {
	const [state, setState] = useState({
		source: "",
		asrTempOutput: "",
		translation: "",
		sourceLanguage: languageCs,
		targetLanguage: languageUk,
		loading: false,
		loadingError: null,
	});
	const [loading, setLoading] = useState(false); // todo
	const [loadingError, setLoadingError] = useState(null);  // todo

	const { t } = useTranslation();


	let inputTypeStatistics = "keyboard";

	React.useEffect(() => {
		const defaultSource = localStorage.getItem("lastTranslationSource");

		if(defaultSource === null)
			return;
		
		if(defaultSource === languageCs.id)
			setState((prevState) => { return { ...prevState, sourceLanguage: languageCs, targetLanguage: languageUk } })
		else
			setState((prevState) => { return { ...prevState, sourceLanguage: languageUk, targetLanguage: languageCs } })
	}, [])

	const focusInput = useRef(null);

	React.useEffect(() => {
		if(focusInput.current)
			focusInput.current.focus();
	}, [focusInput]);

	function handleChangeSource(text, additive = false, fromLanguage = state.sourceLanguage.id, toLanguage = state.targetLanguage.id) {
		setState((prevState) => {
			if(additive){
				if(text.length > 0) text = text.charAt(0).toLocaleUpperCase() + text.slice(1);
				if(text !== "") text += ".";
				if(text !== "" && prevState.source !== "") text = "\n" + text;
				text = prevState.source + text;
			}

			//console.log("fromLanguage: ", fromLanguage, additive, state.sourceLanguage.id);

			return { ...prevState, source: text };
		});

		setLoading(true);

		if(fromLanguage === languageCs.id)
			setState((prevState) => { return { ...prevState, sourceLanguage: languageCs, targetLanguage: languageUk } })
		else
			setState((prevState) => { return { ...prevState, sourceLanguage: languageUk, targetLanguage: languageCs } })

		if(typeof window !== 'undefined')
			window.localStorage.setItem("lastTranslationSource", fromLanguage);

		debouncedSave(fromLanguage, toLanguage, text);
		debouncedTranslate({
			text,
			fromLanguage,
			toLanguage,
			loadingID: ++loadingID,
			inputType: inputTypeStatistics,
		})
		.then((data) => {
			// this request is last that was sent
			if(data.loadingID === loadingID)
				setLoading(false);
			
			// this request has some new information
			if(loadedID < data.loadingID){
				loadedID = data.loadingID;
				setState((prevState) => { return { ...prevState, translation: data.data.trim() } })
				setLoadingError(null);
			}

		})
		.catch((error) => {
			setLoading(false);
			setLoadingError(error.data || "");
			console.error("Error when loading translation");
			console.error(error);
		})
	}

	const flipLanguages = () => {
		const oldSource = state.sourceLanguage;
		const oldTarget = state.targetLanguage;
		setState((prevState) => { return { ...prevState, translation: "" } })

		inputTypeStatistics = "swap-languages";
		/**/// switch - keep source text as source
		handleChangeSource(state.source, false, oldTarget.id, oldSource.id);
		/*/ - insert translation as new source
		handleChangeSource(state.translation, false, oldTarget.id, oldSource.id);
		/**/
	}

	const RU_LETTERS = "эыё";
	const UK_LETTERS = "бгґджзклмнпрстфхцчшщаеєиіїоуюяйвь";
	const CS_LETTERS = "aábcčdďeéěfghchiíjklmnňoópqrřsštťuúůvwxyýzž";
	const checkAlphabet = (text) => {
		let RU_count = 0, UK_count = 0, CS_count = 0;

		if(typeof text != "string") return "";

		for (const letter of text.toLowerCase()) {
			if(RU_LETTERS.includes(letter)) 
				RU_count++;
			if(UK_LETTERS.includes(letter)) 
				UK_count++;
			if(CS_LETTERS.includes(letter)) 
				CS_count++;
		}

		if(RU_count > 4) // bias of 4 chars
			return "ru"
		if(UK_count > CS_count * 1.1) // bias of 10%
			return "uk"
		if(CS_count > UK_count * 1.1) // bias of 10%
			return "cs"
		return ""; // cant decide
	}

	const RenderLocalizationTooltip = () => {
		switch(checkAlphabet(state.source)){
			case "ru": return (
				<Tooltip title={t("form:maybeRusian")}>
					<FeedbackOutlinedIcon color="error"></FeedbackOutlinedIcon>
				</Tooltip>
			)
			case "uk": 
				if (state.sourceLanguage.id != "uk") return (
					<Tooltip title={t("form:maybeUkrinian")}>
						<FeedbackOutlinedIcon color="warning"></FeedbackOutlinedIcon>
					</Tooltip>
				)
				break;
			case "cs": 
				if (state.sourceLanguage.id != "cs") return (
					<Tooltip title={t("form:maybeCzech")}>
						<FeedbackOutlinedIcon color="warning"></FeedbackOutlinedIcon>
					</Tooltip>
				)
			break;
		}
	}

	return (
		<div className={styles.flex}>
			<Paper elevation={2} className={styles.translationFieldContainer}>
				<div className={styles.translationHeaderContainer}>
					<div className={styles.languageContainer}>
						<img
							width={30}
							height={30}
							alt="flag"
							src = { state.sourceLanguage.flag.src }
							className={styles.flagIcon}
						/>
						<label className={styles.label} htmlFor="destination">
							{ state.sourceLanguage.name }
						</label>
						{ RenderLocalizationTooltip() }
					</div>
					<div className={styles.asrTempOutput}>{state.asrTempOutput}</div>
					<div className={styles.asrContainer}>
						<ASR
							onresult = {(data) => { setState((prevState => { return { ...prevState, asrTempOutput: data } })) }}
							onfinal = {(data) => {
								inputTypeStatistics = "voice";
								handleChangeSource(data, true);
								setState((prevState => { return { ...prevState, asrTempOutput: "" } }))
							}}
							onerror = {(data) => { console.error("from form onerror ASR:", data); }} // todo remove or show to user
							language = { state.sourceLanguage.id }
						/>
					</div>
				</div>
				<TextField
					value={state.source}
					label=" " 
					onChange={(e) => {
						switch(e.nativeEvent.inputType){
							case "insertFromPaste": inputTypeStatistics = "clipboard"; break;
							case "deleteContentBackward":
							case "insertText":
							default: inputTypeStatistics = "keyboard";
						}
						return handleChangeSource(e.target.value);
					}}
					id = "source"
					variant = "filled"
					color = { state.source.length > 2000 ? "warning" : "primary" }
					error = { state.source.length > 5000 }
					helperText = { state.source.length > 2000 ? "maximum text size is 5000 chars" : "" }
					multiline
					inputRef = { focusInput }
					minRows = { 6 }
					InputProps = { {
						className : styles.sourceInput,
						endAdornment: (
							<InputAdornment position='end'>
								{ state.source.length !== 0 &&
									<Tooltip 
										className={styles.removeButton}
										title={t("form:clearSourceText")}
									>
										<IconButton 
											onClick={() => { handleChangeSource(""); focusInput.current.focus(); }}
										>
											<ClearIcon/>
										</IconButton>
									</Tooltip>
								}
							</InputAdornment>
						),
					} }
				/>
			</Paper>

			<div className={styles.switchButtonWrapper}>
				<Tooltip title={t("form:swapLanguages")}>
					<IconButton
						aria-label="switch languages"
						onClick={ () => { flipLanguages(); focusInput.current.focus(); } }
						size="large"
					>
						<SwapVertIcon fontSize="large" color="primary" />
					</IconButton>
				</Tooltip>
			</div>

			<Paper elevation={2} className={styles.translationFieldContainer}>
				<div className={styles.translationHeader}>
					<div className={styles.languageContainer}>
						<img	
							width={30}
							height={30}
							alt="flag"
							src={state.targetLanguage.flag.src}
							className={styles.flagIcon}
						/>
						<label className={styles.label} htmlFor="destination">
							{state.targetLanguage.name}
						</label>
					</div>

					{state.translation.length !== 0 && navigator.clipboard !== undefined &&
						<Tooltip title={t("form:copyToClipboard")}>
						<Button 
							onClick={() => {navigator.clipboard.writeText(state.translation)}}
							variant="text"
							size="small"
							startIcon={<ContentCopyIcon/>}
						>
							{t("common:copy")}
						</Button>
					</Tooltip>}
					<TranslationHistory
						getHistory={() => getHistory()}
						onSelect={ (...args) => { inputTypeStatistics = "history" ; return handleChangeSource(...args); } }
					/>
				</div>
				{loading && (<LinearProgress className={styles.loadingBar}/>)}
				<div className={styles.translationOutput}>
					{loadingError !== null ? 
						<div className={styles.networkError}>
							<ErrorOutlineIcon/>
							<span>{loadingError !== "" ? loadingError : "Translation error"}</span>
							<Button
								onClick={()=>{
									handleChangeSource(state.source);
								}}
							>
								Try again
							</Button>
						</div>
						:
						<div>
							<div className={styles.translationText}>
								{state.translation.split('\n').map((item, i) => (<p key={i} style={{margin: 0}}>{(item !== "") ? item : <br />}</p>))}
							</div>

							<div className={styles.transliteration}>
								{state.targetLanguage.transliterate(state.translation).split('\n').map((item, i) => (<p key={i} style={{margin: 0}}>{(item !== "") ? item : <br />}</p>))}
							</div>
						</div>
					}
				</div>
			</Paper>
		</div>
	);
};

export default Form;
