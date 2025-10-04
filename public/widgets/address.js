(function () {
  function createAddressWidget(CMS) {
    const { h, createClass } = CMS;

    const Control = createClass({
      getInitialState() {
        return { value: this.props.value || "", verified: false, touched: false };
      },

      handleChange(e) {
        this.setState({ value: e.target.value, touched: true }, () =>
          this.props.onChange(this.state.value)
        );
      },

      toggleVerified() {
        this.setState((prev) => ({ verified: !prev.verified }));
      },

      render() {
        const { value, touched, verified } = this.state;
        const needsConfirm = touched && !verified;

        return h("div", { style: { marginBottom: "1.5rem", position: "relative" } }, [
          h(
            "div",
            {
              style: {
                position: "absolute",
                top: "0",
                right: "0",
                margin: "0.25rem",
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
          h("input", {
            type: "text",
            value,
            placeholder: "Enter business address…",
            onInput: this.handleChange,
            style: {
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
              boxSizing: "border-box",
              paddingRight: "6rem",
            },
          }),
          needsConfirm &&
            h("p", { style: { color: "red", fontSize: "0.8rem" } }, 'Click "Confirm" to verify.'),
        ]);
      },
    });

    const Preview = (props) => h("div", {}, `Address: ${props.value}`);

    CMS.registerWidget("address-verify", Control, Preview);
  }

  function tryRegister() {
    if (window.CMS && window.CMS.registerWidget && window.CMS.createClass) {
      createAddressWidget(window.CMS);
    } else {
      setTimeout(tryRegister, 50);
    }
  }

  tryRegister();
})();
