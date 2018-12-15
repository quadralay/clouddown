function CloudDownEditor(textArea, onContentChanged) {
  if (!textArea) {
    return {};
  }

  var clouddown = {};
  var fileContent = textArea.value;

  var elements = {};

  var cleditor = undefined;
  var pagedown = undefined;

  function createElements() {
    // container
    var container = document.createElement('div');
    container.id = 'clouddown-panel';
    container.class = 'clouddown-panel';

    // button bar
    var buttonBar = document.createElement('div');
    buttonBar.id = 'clouddown-button-bar';
    buttonBar.className = 'clouddown-button-bar';

    // input container
    var inputContainer = document.createElement('div');
    inputContainer.className = 'clouddown-container';

    // input
    var input = document.createElement('pre');
    input.id = 'clouddown-input';
    input.className = 'clouddown-input';
    input.innerText = fileContent;

    // preview
    var preview = document.createElement('div');
    preview.id = 'clouddown-preview';
    preview.className = 'clouddown-preview';

    // assign to elements object
    elements.input = input;
    elements.buttonBar = buttonBar;
    elements.preview = preview;

    // append them to container
    inputContainer.appendChild(input);
    container.appendChild(buttonBar);
    container.appendChild(inputContainer);
    container.appendChild(preview);

    textArea.parentNode.replaceChild(container, textArea);
  }

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

    if (onContentChanged) {
      cleditor.on('contentChanged', onContentChanged);
    }

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

    //var help = function () { alert("Do you need help?"); }

    var options = {
      //helpButton: { handler: help },
      extensions: ["strikethrough"],
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
    createElements();
    initCledit();
    initPagedown();
  }

  init();

  clouddown.getFileContent = function () {
    return cleditor.getContent();
  }

  clouddown.setFileContent = function (text) {
    cleditor.setContent(text, true);
  }

  return clouddown;
}