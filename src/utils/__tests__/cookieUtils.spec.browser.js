import getCookieAsMap from '../../utils/cookieUtils';

//Cookie Mock data
const CookieData = {
  //Valid Cookie, non htz data
  emptyCookie: '',
  regularCookie: '_ga=GA1.2.903648427.1454226071',
  //Valid Cookie, htz data
  htzCookie: '__gads=ID=0531021ded313792:T=1453046265:S=ALNI_Mbsr_tkDXIE0Lww1gy141DFC674OQ;' +
  ' _cb_ls=1; tmpPersistentuserId=d1498cbb23ce4bdd8d6a8b94586ca760; TmUserId=239415704158208;' +
  ' anonPopup=poped; tmsso=userId%3D4888669312%3AuserName%3Delia.grady%40haaretz.co.il' +
  '%3AticketId%3D3134313934313532353536323535323934303437%3A' +
  'timestamp%3D1453899282835%3Aupref%3D17%3Ausrae%3D0%3Aurgdr%3Dnull%3A' +
  'firstName%3DElia%3AlastName%3DGrady%3Afbid%3D%3A; login=elia.grady%40haaretz.co.il;' +
  ' p=d41d8cd98f00b204e9800998ecf8427e; i=531637; remember=1; _ga=GA1.3.1992185926.1453044840;' +
  ' _chartbeat2=CqhuorR-dScC2WxQ6.1452506457680.1453991205421.1000110110011111; HtzRusr=10;' +
  ' __utma=216435343.1992185926.1453044840.1453999471.1453999471.88; ' +
  '__utmz=216435343.1453990596.41.6.utmcsr=google|utmccn=(organic)|' +
  'utmcmd=organic|utmctr=(not%20provided); __utmv=216435343.|1=user-type=Registered=1;' +
  ' __vrf=1454227231691Hj0KVZji90RcQm4pNPz9NInSAbmnuXCc; acl=acl; impressions='
};



describe( 'cookieUtilModule', () => {

  describe( 'getCookieAsMap - with valid cookie', () => {
    before(() => {
      CookieData.htzCookie.split(';').map(cookie => document.cookie = cookie)
    });

    it( 'should not throw an error', () => {
      expect( getCookieAsMap ).to.not.throw;
    } );

    it( 'should be a function', () => {
      expect( getCookieAsMap ).to.be.a.function;
    } );

    it( 'should parse a valid cookie correctly', () => {
      let map = getCookieAsMap();
      expect( map ).to.be.a.object;
    } );

    it( 'parsed map should contain a valid cookie correctly', () => {
      let map = getCookieAsMap();
      expect( map['tmsso'] ).to.be.a.object;
    } );
    describe( 'tmsso map', () => {
      let tmssoMap;
      before(() => {
        tmssoMap = getCookieAsMap()['tmsso'];
        //console.log("TMSSO Map is: ", tmssoMap);
      });
      it( 'should have a userId', () => {
        expect( tmssoMap.userId).to.equal('4888669312');
      } );
      it( 'should contain the following keys: userId, userName, firstName, lastName', () => {
        expect( tmssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
      } );
    });
  });

  describe( 'getCookieAsMap - with regular cookie', () => {
    before(() => {
      deleteAllCookies();
      CookieData.regularCookie.split(';').map(cookie => document.cookie = cookie)
    });
    it( 'should not throw an error', () => {
      expect( getCookieAsMap ).to.not.throw;
    } );

    it( 'should be a function', () => {
      expect( getCookieAsMap ).to.be.a.function;
    } );

    it( 'should parse a regular cookie correctly', () => {
      let map = getCookieAsMap();
      expect( map ).to.be.a.object;
    } );

    it( 'should not have a tmsso key', () => {
      let map = getCookieAsMap();
      //console.log(map['tmsso'])
      expect( map['tmsso'] ).to.be.undefined;
    } );
  });

} );


//Delete all cookies
function deleteAllCookies() {
  document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" +
        new Date().toUTCString() + ";path=/"); });
}
