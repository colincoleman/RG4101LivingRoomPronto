/*!
  @author Colin Coleman
  @title com.kontrollsmart.CrestronInterface-MappingsColin
  @version 1.1
*/


function mapTagToDigitalJoin(tag)
{
	switch(tag)
	{
		case "PS_CHANNEL_UP":
			return "1";
			break;
		case "PS_CHANNEL_DOWN":
			return "2";
			break;
		case "PS_CURSOR_UP":
			return "3";
			break;
		case "PS_CURSOR_DOWN":
			return "4";
			break;
		case "PS_CURSOR_LEFT":
			return "5";
			break;
		case "PS_CURSOR_RIGHT":
			return "6";
			break;
		case "PS_OK":
			return "7";
			break;
		case "PS_BACK":
			return "8";
			break;
		case "PS_INFO":
			return "9";
			break;
		case "PS_VOLUME_UP":
			return "10";
			break;
		case "PS_VOLUME_DOWN":
			return "11";
			break;
		case "PS_MENU":
			return "12";
			break;
		case "PS_GUIDE":
			return "13";
			break;
		case "PS_FIRM1":
			return "14";
			break;
		case "PS_FIRM5":
			return "15";
			break;
		case "BUTTON_RED":
			return "16";
			break;
		case "BUTTON_YELLOW":
			return "17";
			break;
		case "BUTTON_GREEN":
			return "18";
			break;
		case "BUTTON_BLUE":
			return "19";
			break;
		case "BUTTON_SCANFORWARD":
			return "20";
			break;
		case "BUTTON_SCANREVERSE":
			return "21";
			break;
		case "BUTTON_PAUSE":
			return "22";
			break;
		case "BUTTON_PLAY":
			return "23";
			break;
		case "BUTTON_RECORD":
			return "24";
			break;
		case "BUTTON_STOP":
			return "25";
			break;
		case "DIGIT0":
			return "26";
			break;
		case "DIGIT1":
			return "27";
			break;
		case "DIGIT2":
			return "28";
			break;
		case "DIGIT3":
			return "29";
			break;
		case "DIGIT4":
			return "30";
			break;
		case "DIGIT5":
			return "31";
			break;
		case "DIGIT6":
			return "32";
			break;
		case "DIGIT7":
			return "33";
			break;
		case "DIGIT8":
			return "34";
			break;
		case "DIGIT9":
			return "35";
			break;
		case "PS_MUTE":
			return "36";
			break;
		case "BUTTON_WATCHTV":
			return "38";
			break;
		case "ALLOFF":
			return "39";
			break;
		case "BUTTON_LISTENRADIO":
			return "40";
			break;
		case "BUTTON_WATCHSMARTTV":
			return "41";
			break;

		case "DS_Play":
			return "51";
			break;
		case "DS_Stop":
			return "52";
			break;
		case "DS_Pause":
			return "53";
			break;
		case "DS_Track+":
			return "54";
			break;
		case "DS_Track-":
			return "55";
			break;

		case "DS_NRKP1":
			return "56";
			break;
		case "DS_NRKP2":
			return "57";
			break;
		case "DS_NRKP3":
			return "58";
			break;
		case "DS_NRKMP3":
			return "61";
			break;
		case "DS_ROX":
			return "64";
			break;
		case "DS_RadioNorge":
			return "65";
			break;
		case "DS_BBCRadio1":
			return "66";
			break;
		case "DS_BBCRadio2":
			return "67";
			break;
		case "DS_BBCRadio4":
			return "68";
			break;
		case "DS_LinnClassic":
			return "73";
			break;
		case "DS_LinnRadio":
			return "72";
			break;
		case "DS_LinnJazz":
			return "71";
			break;


		case "BUTTON_USEPS3":
			return "85";
			break;
		case "BUTTON_WATCHATV":
			return "86";
			break;
		case "BUTTON_ATV_UP":
			return "87";
			break;
		case "BUTTON_ATV_DOWN":
			return "88";
			break;
		case "BUTTON_ATV_LEFT":
			return "89";
			break;
		case "BUTTON_ATV_RIGHT":
			return "90";
			break;
		case "BUTTON_ATV_PLAY":
			return "91";
			break;
		case "BUTTON_ATV_MENU":
			return "92";
			break;
		case "BUTTON_TUNE_NRK_KLASSISK":
			return "93";
			break;
		case "BUTTON_TUNE_NRK_MPETRE":
			return "94";
			break;
		case "BUTTON_TUNE_NRK_P1":
			return "95";
			break;
		case "BUTTON_TUNE_NRK_P2":
			return "96";
			break;
		case "BUTTON_TUNE_NRK_P3":
			return "97";
			break;
		case "BUTTON_TUNE_NRK_NYHETER":
			return "98";
			break;
		case "BUTTON_TUNE_RADIO_NORGE":
			return "99";
			break;
		case "BUTTON_TUNE_TANGO":
			return "100";
			break;
		case "BUTTON_TUNE_RADIO_1":
			return "101";
			break;
		case "BUTTON_TUNE_LOCAL3":
			return "102";
			break;
		case "BUTTON_TUNE_TMURASAM":
			return "103";
			break;
		case "BUTTON_TUNE_RADIO_METRO":
			return "104";
			break;
		case "BUTTON_TUNE_LOCAL_5":
			return "105";
			break;
		case "BUTTON_TUNE_RADIO_SWEDEN":
			return "106";
			break;
		case "BUTTON_TUNE_SVENSK_P4":
			return "107";
			break;
		case "BUTTON_TUNE_NORSK_P4":
			return "108";
			break;
		case "BUTTON_TUNE_DANSK_P1":
			return "109";
			break;
		case "BUTTON_TUNE_DANSK_P3":
			return "110";
			break;
		case "BUTTON_TUNE_KLEM_FM":
			return "111";
			break;
		case "BUTTON_TUNE_THE_BEAT":
			return "112";
			break;
		case "BUTTON_TUNE_NRJ":
			return "113";
			break;
		case "BUTTON_LISTENDS":
			return "114";
			break;
		case "XBMC_PlayPause":
			return "116";
			break;
		case "XBMC_Stop":
			return "117";
			break;
		case "XBMC_Forward":
			return "118";
			break;
		case "XBMC_Rewind":
			return "119";
			break;
		case "XBMC_Next":
			return "120";
			break;
		case "XBMC_Previous":
			return "121";
			break;
		case "XBMC_CursorUp":
			return "122";
			break;
		case "XBMC_CursorDown":
			return "123";
			break;
		case "XBMC_CursorLeft":
			return "124";
			break;
		case "XBMC_CursorRight":
			return "125";
			break;
		case "XBMC_Select":
			return "126";
			break;
		case "XBMC_Back":
			return "127";
			break;
		case "XBMC_Menu":
			return "128";
			break;
		case "XBMC_Info":
			return "129";
			break;
		case "XBMC_OSD":
			return "130";
			break;
		case "XBMC_TV":
			return "131";
			break;
		case "XBMC_Movies":
			return "132";
			break;
		case "XBMC_FullScreen":
			return "133";
			break;
		case "XBMC_PageUp":
			return "134";
			break;
		case "XBMC_PageDown":
			return "135";
			break;


		case "TV_NRK1":
			return "151";
			break;
		case "TV_NRK2":
			return "152";
			break;
		case "TV_NRK3":
			return "153";
			break;
		case "TV_TV2":
			return "154";
			break;
		case "TV_TVNorge":
			return "155";
			break;
		case "TV_MAX":
			return "156";
			break;
		case "TV_TV3":
			return "157";
			break;
		case "TV_TV2Zebra":
			return "158";
			break;
		case "TV_Viasat4":
			return "159";
			break;
		case "TV_TV2Nyhetskanalen":
			return "160";
			break;
		case "TV_FEM":
			return "161";
			break;
		case "TV_TV2Bliss":
			return "162";
			break;
		case "TV_TLCNordic":
			return "163";
			break;
		case "TV_NationalGeographic":
			return "164";
			break;
		case "TV_Discovery":
			return "165";
			break;
		case "TV_BBCEntertainment":
			return "166";
			break;
		case "TV_SVT1":
			return "167";
			break;
		case "TV_MTV":
			return "168";
			break;
		case "TV_DisneyChannel":
			return "169";
			break;
		case "TV_Eurosport":
			return "170";
			break;
		case "TV_TV2Sport":
			return "171";
			break;
		case "TV_VOX":
			return "172";
			break;
		case "TV_FoxCrime":
			return "173";
			break;
		case "TV_TNT":
			return "174";
			break;
		case "TV_CNNInternational":
			return "175";
			break;
		case "TV_TV2FilmKanalen":
			return "176";
			break;
		case "TV_Canal9":
			return "177";
			break;
		case "TV_LocalTV":
			return "178";
			break;
		case "TV_TRAVEL":
			return "179";
			break;
		case "TV_AnimalPlanet":
			return "180";
			break;
		case "TV_Nickelodeon":
			return "181";
			break;
		case "TV_CartoonNetwork":
			return "182";
			break;
		case "TV_DisneyXD":
			return "183";
			break;
		case "TV_Boomerang":
			return "184";
			break;
		case "TV_DisneyJunior":
			return "185";
			break;
		case "TV_NickJr":
			return "186";
			break;
		case "TV_TV4":
			return "187";
			break;
		case "TV_SVT2":
			return "188";
			break;
		case "TV_DR1":
			return "189";
			break;
		case "TV_TV2Danmark":
			return "190";
			break;
		case "TV_BBCHD":
			return "191";
			break;
		case "TV_BBCLifestyle":
			return "192";
			break;
		case "TV_BBCKnowledge":
			return "193";
			break;
		case "TV_NatGeoWild":
			return "194";
			break;
		case "TV_HistoryChannel":
			return "195";
			break;
		case "TV_ViasatNature-Crime":
			return "196";
			break;
		case "TV_ViasatExplorer":
			return "197";
			break;
		case "TV_ViasatHistory":
			return "198";
			break;
		case "TV_DiscoveryShowcase":
			return "199";
			break;
		case "TV_DiscoveryScience":
			return "200";
			break;
		case "TV_DiscoveryWorld":
			return "201";
			break;
		case "TV_InvestigationDiscovery":
			return "202";
			break;
		case "TV_CBSReality":
			return "203";
			break;
		case "TV_FineLivingNetwork":
			return "204";
			break;
		case "TV_FashionTV":
			return "205";
			break;
		case "TV_STAR":
			return "206";
			break;
		case "TV_Silver":
			return "207";
			break;
		case "TV_Showtime":
			return "208";
			break;
		case "TV_TCM":
			return "209";
			break;
		case "TV_Ginx":
			return "210";
			break;
		case "TV_Eurosport2":
			return "211";
			break;
		case "TV_MotorsTV":
			return "212";
			break;
		case "TV_ESPNClassicSports":
			return "213";
			break;
		case "TV_ESPNAmerica":
			return "214";
			break;
		case "TV_ExtremeSport":
			return "215";
			break;
		case "TV_Fatstone":
			return "216";
			break;
		case "TV_MTVLive":
			return "217";
			break;
		case "TV_VH1":
			return "218";
			break;
		case "TV_VH1Classic":
			return "219";
			break;
		case "TV_MTVRocks":
			return "220";
			break;
		case "TV_MTVHits":
			return "221";
			break;
		case "TV_MTVDance":
			return "222";
			break;
		case "TV_MTVMusic":
			return "223";
			break;
		case "TV_MEzzo":
			return "224";
			break;
		case "TV_EuroNews":
			return "225";
			break;
		case "TV_BBCWorldNews":
			return "226";
			break;
		case "TV_AlJazeeraEnglish":
			return "227";
			break;
		case "TV_SkyNews":
			return "228";
			break;
		case "TV_CNBC":
			return "229";
			break;
		case "TV_Bloomberg":
			return "230";
			break;
		case "TV_France24English":
			return "231";
			break;
		case "TV_France24":
			return "232";
			break;
		case "TV_TV5Monde":
			return "233";
			break;
		case "TV_DasErste":
			return "234";
			break;
		case "TV_RTL":
			return "235";
			break;
		case "TV_3Sat":
			return "236";
			break;
		case "TV_TVFinland":
			return "237";
			break;
		case "TV_RaiUno":
			return "238";
			break;
		case "TV_TVEInternacional":
			return "239";
			break;
		case "TV_GodTV":
			return "240";
			break;
		case "TV_VisjonNorge":
			return "241";
			break;
		case "TV_TV2BPLHD1":
			return "242";
			break;
		case "TV_TV2BPLHD2":
			return "243";
			break;
		case "TV_TV2BPLHD3":
			return "244";
			break;
		case "TV_TV2SportXtra1":
			return "245";
			break;
		case "TV_TV2SportXtra2":
			return "246";
			break;
		case "TV_CMoreLive":
			return "247";
			break;
		case "TV_CMoreFotball":
			return "248";
			break;
		case "TV_CMoreHockey":
			return "249";
			break;
		case "TV_CMoreTennis":
			return "250";
			break;
		case "TV_CMoreExtreme":
			return "251";
			break;
		case "TV_CMoreLive2":
			return "252";
			break;
		case "TV_CMoreLive3":
			return "253";
			break;
		case "TV_CMoreLive4":
			return "254";
			break;
		case "TV_CMoreFirst":
			return "255";
			break;
		case "TV_CMoreHits":
			return "256";
			break;
		case "TV_CMoreSeries":
			return "257";
			break;
		case "TV_CMoreEmotion":
			return "258";
			break;
		case "TV_CMoreAction":
			return "259";
			break;
		case "TV_CMoreKids":
			return "260";
			break;
		case "TV_SFKanalen":
			return "261";
			break;
		case "TV_GetInfokanal":
			return "262";
			break;
		case "TV_ViasatSport":
			return "263";
			break;
		case "TV_ViasaFotball":
			return "264";
			break;
		case "TV_ViasatMotor":
			return "265";
			break;
		case "TV_ViasatHockey":
			return "266";
			break;
		case "TV_ViasatGolf":
			return "267";
			break;
		case "TV_ViasatFilm":
			return "268";
			break;
		case "TV_ViasatFilmNordic":
			return "269";
			break;
		case "TV_ViasatFilmFamily":
			return "270";
			break;
		case "TV_ViasatFilmAction":
			return "271";
			break;
		case "TV_ViasatFilmClassic":
			return "272";
			break;
		case "TV_ViasatFilmDrama":
			return "273";
			break;
		case "TV_RikstotoDirekte":
			return "274";
			break;
		case "TV_TVPolonia":
			return "275";
			break;
		case "TV_TRTTurk":
			return "276";
			break;
		case "TV_HRT1":
			return "277";
			break;
		case "TV_RTRPlaneta":
			return "278";
			break;
		case "TV_AlJazeeraArabic":
			return "279";
			break;
		case "TV_PrimeTV":
			return "280";
			break;
		case "TV_ARYDigital":
			return "281";
			break;
		case "TV_SETAsia":
			return "282";
			break;
		case "TV_TVChile":
			return "283";
			break;
		case "TV_ZeeTV":
			return "284";
			break;

	}
};

function mapJoinToSerialTag(join)
{
	switch(join)
	{
		case 1:
			return "VolDisp";
			break;
		case 2:
			return "11";
			break;
	}
};