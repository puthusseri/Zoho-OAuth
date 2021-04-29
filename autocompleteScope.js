$(function() {
    var items = [ 'Desk.tickets.ALL', 'Desk.tickets.READ', 'Desk.tickets.WRITE', 'Desk.tickets.UPDATE', 'Desk.tickets.CREATE', 'Desk.tickets.DELETE', 
        'Desk.contacts.READ', 'Desk.contacts.WRITE', 'Desk.contacts.UPDATE', 'Desk.contacts.CREATE',
        'Desk.tasks.ALL', 'Desk.tasks.WRITE', 'Desk.tasks.READ', 'Desk.tasks.CREATE', 'Desk.tasks.UPDATE', 'Desk.tasks.DELETE',
        'Desk.basic.READ', 'Desk.basic.CREATE', 
        'Desk.settings.ALL', 'Desk.settings.WRITE', 'Desk.settings.READ', 'Desk.settings.CREATE', 'Desk.settings.UPDATE', 'Desk.settings.DELETE', 
        'Desk.search.READ', 
        'Desk.events.ALL', 'Desk.events.READ', 'Desk.events.WRITE', 'Desk.events.CREATE', 'Desk.events.UPDATE', 'Desk.events.DELETE', 
        'Desk.articles.READ', 'Desk.articles.CREATE', 'Desk.articles.UPDATE', 'Desk.articles.DELETE'
    ];
        
    function split( val ) {
      return val.split( /,\s*/ );
    }
    function extractLast( term ) {
      return split( term ).pop();
    }
 
    $( "#scope" )
      .autocomplete({
        minLength: 0,
        source: function( request, response ) {
          response( $.ui.autocomplete.filter(
            items, extractLast( request.term ) ) );
        },
        focus: function() {
          return false;
        },
        select: function( event, ui ) {
          var terms = split( this.value );
          // remove the current input
          terms.pop();
          // add the selected item
          terms.push( ui.item.value );
          // add placeholder to get the comma-and-space at the end
          terms.push( "" );
          this.value = terms.join( "," );
          return false;
        }
      });
  });