//GlobalConfig Mock data
const dfpConfigMock = {
  referrer : "",
  isMobile: false,
  isHomepage: true,
  department: '_homepage',
  domain: 'haaretz.co.il',
  path: [],
  environment: 1,
  articleId: null,
  utm_ : {
    content: undefined,
    source: undefined,
    medium: undefined,
    campaign: undefined,
  },
  gStatCampaignNumber: undefined,
  adSlotConfig: {
    "haaretz.co.il.web.plazma" : {
      id: "haaretz.co.il.web.plazma",
      responsive: true,
      adSizeMapping: [[970, 90]],
      responsiveAdSizeMapping : {
        xxs: [[468, 60]],
        xs: [[728, 90]],
        s: [[970, 250],[980, 190],[970, 90],[960, 150]],
        m: [[970, 250],[980, 190],[960, 150],[970, 90],[3, 3]],
        l: [[970, 250],[980, 190],[960, 150],[970, 90],[1280, 200],[3, 3]],
        xl: [[970, 250],[980, 190],[960, 150],[970, 90],[1280, 200],[3, 3]],
        xxl: [[970, 250],[980, 190],[960, 150],[970, 90],[1280, 200],[3, 3]],
      },
      blacklistReferrers: "",
      whitelistReferrers: "",
    },
    "haaretz.co.il.web.marketing.promotional_madrid.left_text3" : {
      id: "haaretz.co.il.web.marketing.promotional_madrid.left_text3",
      responsive: false,
      adSizeMapping: [[375, 102]],
      responsiveAdSizeMapping : {
        xxs: [],
        xs: [],
        s: [],
        m: [],
        l: [],
        xl: [],
        xxl: [],
      },
      blacklistReferrers: "",
      whitelistReferrers: "",
    },
    "haaretz.co.il.web.popunder" : {
      id: "haaretz.co.il.web.popunder",
      responsive: false,
      adSizeMapping: [],
      responsiveAdSizeMapping : {
        xxs: [],
        xs: [],
        s: [],
        m: [],
        l: [],
        xl: [],
        xxl: [],
      },
      blacklistReferrers: "",
      whitelistReferrers: "",
    },
  },
  adManagerConfig : {
    network: 9401,
    adUnitBase: 'haaretz.co.il_web',
  },
  breakpointsConfig : {
    get breakpoints() {
      const isType1 = true; //Override in VM from backend to control this toggle.
      return isType1 ? this.breakpoints1 : this.breakpoints2;
    },
    // Type 1
    breakpoints1 : {
      xxs: 600,
      xs: 761,
      s: 993,
      m: 1009,
      l: 1291,
      xl: 1600,
      xxl: 1900,
    },
    // Type 2
    breakpoints2 : {
      xxs: 600,
      xs: 1000,
      s: 1150,
      m: 1281,
      l: 1600,
      xl: 1920,
      xxl: 1920,
    }
  },
  userConfig: {
    type : undefined,
    age: undefined,
    gender: undefined,
  },
  conflictManagementConfig: {
    "haaretz.co.il.web.plazma": [
      {
        onsize: "1280x200,970x250,3x3",
        avoid: "haaretz.co.il.web.halfpage.floating_x"
      },
      {
        onsize: "1280x200,970x250,3x3",
        avoid: "haaretz.co.il.web.ruler"
      }
    ]
  },
  impressionManagerConfig : {
    "haaretz.co.il.web.plazma_section" : {
      id: 'haaretz.co.il.web.plazma',
      target: 'section',
      frequency: '2/1hour',
    },
    "haaretz.co.il.web.marketing.promotional_madrid.left_text3_section": {
      id: 'haaretz.co.il.web.marketing.promotional_madrid.left_text3',
      target: 'homepage',
      frequency: '2/1day',
    },
    "haaretz.co.il.web.popunder_all": {
      id: 'haaretz.co.il.web.popunder',
      target: 'all',
      frequency: '10/10hour',
    }

  }
};

export default dfpConfigMock;


