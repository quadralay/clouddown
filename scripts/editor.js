function CloudDownEditor(input, buttonBar, preview, onContentChanged) {
  if (!input || !buttonBar || !preview) {
    return {};
  }

  var clouddown = {};

  var elements = {
    input: input,
    buttonBar: buttonBar,
    preview, preview
  }

  var cleditor = undefined;
  var pagedown = undefined;

  function initCledit() {
    // Initialize cledit
    //
    cleditor = window.cledit(
      elements.input
    )

    var prismGrammar = window.mdGrammar({
      fences: true,
      tables: true,
      footnotes: true,
      abbrs: true,
      deflists: true,
      tocs: true,
      dels: true,
      subs: true,
      sups: true,
      maths: true
    })

    cleditor.on('contentChanged', onContentChanged);

    cleditor.init({
      sectionHighlighter: function (section) {
        return window.Prism.highlight(section.text, prismGrammar)
      },
      // Optional (increases performance on large documents)
      sectionParser: function (text) {
        var offset = 0
        var sectionList = []
          ; (text + '\n\n').replace(/^.+[ \t]*\n=+[ \t]*\n+|^.+[ \t]*\n-+[ \t]*\n+|^\#{1,6}[ \t]*.+?[ \t]*\#*\n+/gm, function (match, matchOffset) {
            sectionList.push(text.substring(offset, matchOffset))
            offset = matchOffset
          })
        sectionList.push(text.substring(offset))
        return sectionList
      }
    })

    elements.input = cleditor;
  }

  function initPagedown() {
    // Initialize pagedown
    //
    var converter = new Markdown.Converter();

    //converter.hooks.chain("preConversion", function (text) {
    //  return text.replace(/\b(a\w*)/gi, "*$1*");
    //});

    converter.hooks.chain("plainLinkText", function (url) {
      return "This is a link to " + url.replace(/^https?:\/\//, "");
    });

    // "all" is the default
    Markdown.Extra.init(converter, { highlighter: "prettify" });

    var help = function () { alert("Do you need help?"); }

    var options = {
      helpButton: { handler: help },
      strings: { quoteexample: "whatever you're quoting, put it right here" }
    };

    pagedown = new Markdown.Editor(converter, elements, options);

    pagedown.hooks.chain("onPreviewRefresh", prettyPrint); // google code prettify

    pagedown.run();

    /*pagedownEditor.run();
    pagedownEditor.hooks.set('insertLinkDialog', function (callback) {
      store.dispatch('modal/open', {
        type: 'link',
        callback,
      });
      return true;
    });
    pagedownEditor.hooks.set('insertImageDialog', function (callback) {
      store.dispatch('modal/open', {
        type: 'image',
        callback,
      });
      return true;
    });*/
  }

  function init() {
    initCledit();
    initPagedown();
  }

  init();

  clouddown.getFileContent = function () {
    return cleditor.getContent();
  }

  return clouddown;
}