const sample = `
# Hello, World
## Title 2
test **bold**
test *itatic*
test \`code\`
## Title 3
test p1
test p2
test p3
> This is a \`blockquote\`.
> more lines...
> > This is a \`blockquote\` inside another \`blockquote\`
> > more lines...
> > more lines...
> > more lines...
`.trim();

const HEADING_PREFIX = ['# ', '## ', '### ', '#### ', '##### ', '###### '];

class MarkdownEditor {
  renderInlineContent(line) {
    line = line.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
    line = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    line = line.replace(/\*(.*?)\*/g, '<i>$1</i>');
    line = line.replace(/\`(.*?)\`/g, '<code>$1</code>');
    return line;
  }

  renderContent(lines) {
    const result = [];

    for (let i = 0, j = 0; i < lines.length; i = j + 1, j = i) {
      const line = lines[i];

      let flag = false;
      for (let k = 0; k < 6; k++)
        if (line.startsWith(HEADING_PREFIX[k])) {
          result.push({
            tag: 'h' + (k + 1),
            text: this.renderInlineContent(line.slice(k + 2)),
          });
          flag = true;
          break;
        }
      if (flag) continue;

      if (line.startsWith('> ')) {
        while (j + 1 < lines.length && lines[j + 1].startsWith('> ')) ++j;
        const copied = JSON.parse(JSON.stringify(lines.slice(i, j + 1)));
        for (let k = 0; k < copied.length; k++) {
          copied[k] = copied[k].slice(2);
        }
        result.push({
          tag: 'blockquote',
          children: this.renderContent(copied),
        });
        continue;
      }

      if (line) {
        result.push({
          tag: 'p',
          text: this.renderInlineContent(line),
        });
      }
    }

    return result;
  }

  renderDOM($root, vdomtree) {
    let result = '';
    function walk(vnode) {
      if (vnode instanceof Array) {
        for (const single of vnode) {
          walk(single);
        }
      } else {
        result += '<' + vnode.tag + '>';
        if (vnode.text) {
          result += vnode.text;
        }
        if (vnode.children) {
          walk(vnode.children);
        }
        result += '</' + vnode.tag + '>';
      }
    }
    walk(vdomtree);
    console.log('result:', result);
    $root.innerHTML = result;
  }

  render() {
    if (this.$editor === null || this.$preview === null) {
      throw new Error('Markdown Editor is not installed.');
    }
    const content = this.$editor.value;
    const vdomtree = this.renderContent(content.split('\n'));
    console.log('vdomtree:', vdomtree);
    this.renderDOM(this.$preview, vdomtree);
  }

  install($editor, $preview) {
    this.$editor = $editor;
    this.$preview = $preview;

    this.$editor.value = sample;
    this.render();
  }

  constructor() {
    this.$editor = null;
    this.$preview = null;
  }
}

window.MDE = new MarkdownEditor();
