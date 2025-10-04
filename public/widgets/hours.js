(function () {
  function createHoursWidget(CMS) {
    const { h, createClass } = CMS;

    // Grab Decap's built-in Markdown widget pieces
    const MarkdownControl = CMS.getWidget("markdown").control;
    const MarkdownPreview = CMS.getWidget("markdown").preview;

    const Control = createClass({
      getInitialState() {
        return {
          value: this.props.value || "",
          verified: false,
          touched: false,
        };
      },

      handleChange(val) {
        this.setState({ value: val, touched: true }, () => this.props.onChange(this.state.value));
      },

      toggleVerified() {
        this.setState((prev) => ({ verified: !prev.verified }));
      },

      render() {
        const { value, touched, verified } = this.state;
        const needsConfirm = touched && !verified;

        return h("div", { style: { marginBottom: "1.5rem", position: "relative" } }, [
          // Confirm button top-right
          h(
            "div",
            {
              style: {
                position: "absolute",
                top: "0",
                right: "0",
                margin: "0.25rem 0.25rem 0 0",
                zIndex: 2,
              },
            },
            h(
              "button",
              {
                type: "button",
                onClick: this.toggleVerified,
                style: {
                  background: verified ? "#4CAF50" : "#2196F3",
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.5rem",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                },
              },
              verified ? "Confirmed" : touched ? "Confirm" : "No Changes"
            )
          ),

          // Markdown editor itself
          h(MarkdownControl, {
            ...this.props,
            value,
            onChange: this.handleChange,
          }),

          // Warning text
          needsConfirm &&
            h(
              "p",
              { style: { color: "red", fontSize: "0.8rem", marginTop: "0.25rem" } },
              'Click "Confirm" to verify this field.'
            ),
        ]);
      },
    });

    const Preview = (props) => h(MarkdownPreview, { ...props });

    CMS.registerWidget("hours-verify", Control, Preview);
  }

  function tryRegister() {
    if (window.CMS && window.CMS.registerWidget && window.CMS.getWidget && window.CMS.createClass) {
      createHoursWidget(window.CMS);
    } else {
      setTimeout(tryRegister, 50);
    }
  }

  tryRegister();
})();
