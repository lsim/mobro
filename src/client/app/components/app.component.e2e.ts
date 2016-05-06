describe('App', () => {

  beforeEach( () => {
      browser.get('');
  });

  it('should have a title', () => {
      expect(browser.getTitle()).toEqual('My Angular2 App');
  });

  it('should have <nav>', () => {
      expect(element(by.css('mb-app mb-navbar nav')).isPresent()).toEqual(true);
  });

  it('should have correct nav text for Lookup', () => {
      expect(element(by.css('mb-app mb-navbar nav a:first-child')).getText()).toEqual('LOOKUP');
  });

  it('should have correct nav text for About', () => {
      expect(element(by.css('mb-app mb-navbar nav a:last-child')).getText()).toEqual('ABOUT');
  });

});
