/* Cookie Mock data */
const CookieData = {
  /* Valid Cookie, non htz data */
  emptyCookie: '',
  htzAnonCookie: '__vrf=1456155277135rWYUjKNIxXut4uWTB3qliRyBnN3zz4KQ;' +
  ' __gads=ID=9e71a1b5a95948a5:T=1456155277:S=ALNI_Mb8tn3A0aqTbOmJ_yqk7o3CwPaH9g;' +
  ' acl=acl; anonymousId=14561552795713452; anonPopup=poped; impressions=; __utmt=1;' +
  ' __utma=216435343.1557816997.1456155277.1456155277.1456155277.1;' +
  ' __utmb=216435343.1.10.1456155280; __utmc=216435343; ' +
  '__utmz=216435343.1456155280.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);' +
  ' __utmv=216435343.|1=user-type=Non-registered=1; _ceg.s=o2ygls; _ceg.u=o2ygls;' +
  ' __vrm=379_285_1345; tm221655337=1%7CMon%2C%2022%20Feb%202016%2019%3A34%3A37%20GMT;' +
  ' _cb_ls=1; _chartbeat2=CekshB3oZjJD8AV7i.1456155286685.1456155286685.1;' +
  ' _ga=GA1.3.1557816997.1456155277; _dc_gtm_UA-65332170-1=1',
  /* Valid Cookie, htz data */
  htzRegisteredCookie: '__vrf=1456155357944H1Q8ocasMk7IJsEPUhDff3gpjepFXU1Q;' +
  ' __gads=ID=d5485991d6aab93a:T=1456155357:S=ALNI_MaSsIiomMKNiPJSz2gA-eR_UobGmg;' +
  ' acl=acl; anonPopup=poped; tm915103525=1%7CMon%2C%2022%20Feb%202016%2019%3A35%3A58%20GMT;' +
  ' __utmt=1; _cb_ls=1; _dc_gtm_UA-65332170-1=1; __vry=0; __vrid=76; __vrm=202_20_1345;' +
  ' __vru=http%253A%252F%252Fwww.haaretz.co.il%252F; _chartbeat5=; tmsso=userId%3D8738500615%3A' +
  'userName%3Delia.grady%40haaretz.co.il%3AticketId%3D3331303937373637353636323535323934303437%3A' +
  'timestamp%3D1456155396943%3Aupref%3D17%3Ausrae%3D29%3Aurgdr%3D2%3A' +
  'firstName%3D%25D7%2590%25D7%259C%25D7%2599%25D7%2594%3A' +
  'lastName%3D%25D7%2592%25D7%25A8%25D7%2599%25D7%2599%25D7%2593%25D7%2599%3Afbid%3D%3A; ' +
  'login=elia.grady%40haaretz.co.il; remember=1; _gat_UA-65332170-1=1; impressions=;' +
  ' __utma=216435343.44216537.1456155358.1456155358.1456155358.1;' +
  ' __utmb=216435343.3.10.1456155361; __utmc=216435343; ' +
  '__utmz=216435343.1456155361.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);' +
  ' __utmv=216435343.|1=user-type=Registered=1; _ceg.s=o2ygp3; _ceg.u=o2ygp3;' +
  ' _ga=GA1.3.44216537.1456155358; _chartbeat2=B6e1_sCHdqkEB1RO1H.1456155367709.1456155405409.1',
  htzPayingCookie: '__vrf=14561533572654BglXzRFkCFxNPS37F8gluvC6DxG7wdq; ' +
  '__gads=ID=dda346359e796375:T=1456153357:S=ALNI_MaqU4LavHSUoKihV4mj_JX32DSHEw; acl=acl; ' +
  'anonPopup=poped; tm76318242=1%7CMon%2C%2022%20Feb%202016%2019%3A02%3A37%20GMT; ' +
  '_cb_ls=1; __utmt=1; _dc_gtm_UA-65332170-1=1; _chartbeat5=; ' +
  'tmsso=userId%3D3057469657%3AuserName%3Dlkodner%40gmail.com%3A' +
  'ticketId%3D3531303330333538323035333634373937303030%3Atimestamp%3D1456154601620%3A' +
  'upref%3D09%3Ausrae%3D37%3Aurgdr%3D2%3AfirstName%3DLior%3AlastName%3DKodner%3A' +
  'fbid%3D615228619%3A; login=lkodner%40gmail.com; p=93279e3308bdbbeed946fc965017f67a; ' +
  'l=1456154603; i=123935; remember=1; HtzPusr=a9c2ac3d318954fec185f2d0596c9ea0;' +
  ' _gat_UA-65332170-1=1; cppu=cppu; ' +
  '__utma=216435343.373956739.1456153357.1456153357.1456153357.1;' +
  ' __utmb=216435343.5.10.1456153360; __utmc=216435343; ' +
  '__utmz=216435343.1456153360.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); ' +
  '__utmv=216435343.|1=user-type=Paying=1; impressions=; _ceg.s=o2yg33; _ceg.u=o2yg33;' +
  ' _ga=GA1.3.373956739.1456153357; _chartbeat2=DyB0m8U510kAUOR.1456153366871.1456154613666.1',
  hdcAnonCookie: '__vrf=14561550275935AOVdD6HdaGdWIHdxs6VjTIvieA3TnUH;' +
  ' __vrrefresh=http%253A%252F%252Fwww.haaretz.com%252F;' +
  ' __gads=ID=8d6b3967b4964c3b:T=1456155027:S=ALNI_Mbkq9fyUUdvuw7IVgoDtnM2cjdyQA;' +
  ' FastPopSessionRequestNumber=1; acl=acl; anonPopup=poped; impressions=; __utmt=1; ' +
  '__utma=120564881.743771821.1456155027.1456155027.1456155027.1;' +
  ' __utmb=120564881.1.10.1456155029; __utmc=120564881;' +
  ' __utmz=120564881.1456155029.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);' +
  ' __utmv=120564881.|1=user-type=Non-registered=1; _ceg.s=o2yget; _ceg.u=o2yget; trd_pw=1;' +
  ' trd_pws=1; trd_first_visit=1456155030; trd_cid=14561550298598580; trd_sid=14561550298598582;' +
  ' _ga=GA1.2.743771821.1456155027; _cb_ls=1; ' +
  '_chartbeat2=BX1saSDnocylCG7FD7.1456155032135.1456155032135.1; __vrm=953_272_1345',
  hdcRegisteredCookie: '__vrf=14561550275935AOVdD6HdaGdWIHdxs6VjTIvieA3TnUH;' +
  ' __vrrefresh=http%253A%252F%252Fwww.haaretz.com%252F; ' +
  '__gads=ID=8d6b3967b4964c3b:T=1456155027:S=ALNI_Mbkq9fyUUdvuw7IVgoDtnM2cjdyQA; ' +
  'FastPopSessionRequestNumber=1; acl=acl; anonPopup=poped; __utmt=1; trd_first_visit=1456155030;' +
  ' _cb_ls=1; _chartbeat2=BX1saSDnocylCG7FD7.1456155032135.1456155106389.1; _chartbeat5=;' +
  ' engsso=userId%3D8738500615%3AuserName%3Delia.grady%40haaretz.co.il%3A' +
  'ticketId%3D3331303937373637353636323535323934303437%3Atimestamp%3D1456155152236%3A' +
  'upref%3D17%3Ausrae%3D29%3Aurgdr%3D2%3AfirstName%3D%25D7%2590%25D7%259C%25D7%2599%25D7%2594%3A' +
  'lastName%3D%25D7%2592%25D7%25A8%25D7%2599%25D7%2599%25D7%2593%25D7%2599%3Afbid%3D%3A;' +
  ' login=elia.grady%40haaretz.co.il; __vrm=242_602_1345; ' +
  '__vru=http%253A%252F%252Fwww.haaretz.com%252Fmisc%252Flogin-page;' +
  ' _chartbeat4=t=DbvSOlBXIYqJBiQbU-BstJSyNM9CC&E=49&EE=49&x=0&c=0.82&y=1019&w=1019;' +
  ' impressions=; trd_pw=3; trd_pws=3; _ceg.s=o2ygie; _ceg.u=o2ygie;' +
  ' __utma=120564881.743771821.1456155027.1456155027.1456155027.1;' +
  ' __utmb=120564881.3.10.1456155029; __utmc=120564881; ' +
  '__utmz=120564881.1456155029.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);' +
  ' __utmv=120564881.|1=user-type=Registered=1; trd_cid=14561550298598580;' +
  ' trd_sid=14561550298598582; _ga=GA1.2.743771821.1456155027',
  hdcPayingCookie: 'FastPopSessionRequestNumber=1;' +
  ' __gads=ID=8a376fc8cfa934c3:T=1456154802:S=ALNI_MZKnORfrse7FpzJnMqC0PSFJeH3AQ;' +
  ' __vrf=1456154802552LwAseAt6YJP0RZ3Z2NrfabqDGWyynTCU;' +
  ' __vrrefresh=http%253A%252F%252Fwww.haaretz.com%252F;' +
  ' acl=acl; anonPopup=poped; __utmt=1; trd_first_visit=1456154805;' +
  ' __vrid=817; _cb_ls=1; engsso=userId%3D3057469657%3AuserName%3Dlkodner%40gmail.com%3A' +
  'ticketId%3D3531303330333538323035333634373937303030%3Atimestamp%3D1456154822705%3A' +
  'upref%3D09%3Ausrae%3D37%3Aurgdr%3D2%3AfirstName%3DLior%3AlastName%3DKodner%3A' +
  'fbid%3D615228619%3A; login=lkodner%40gmail.com; HdcPusr=a9c2ac3d318954fec185f2d0596c9ea0;' +
  ' __vrm=475_610_1903; __vru=http%253A%252F%252Fwww.haaretz.com%252Fmisc%252Flogin-page;' +
  ' impressions=; cppu=cppu; trd_pw=3; trd_pws=3; _ceg.s=o2yg98; _ceg.u=o2yg98; ' +
  '__utma=120564881.758619817.1456154802.1456154802.1456154802.1;' +
  ' __utmb=120564881.3.10.1456154804; __utmc=120564881; ' +
  '__utmz=120564881.1456154804.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none);' +
  ' __utmv=120564881.|1=user-type=Paying=1; trd_cid=14561548045885872; trd_sid=14561548045895882;' +
  ' _ga=GA1.2.758619817.1456154802; _chartbeat2=2RxFdDVBnRUDd6su4.1456154808486.1456154831648.1',
};

export default CookieData;
