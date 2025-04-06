import { define, re } from "api";

export default define({
  name: "pdslspls",
  patches: [
    {
      query: 'testID:"postAtUriShareBtn"',
      patch: [{
        match: re`(0,\i.jsxs)(\i,{testID:"postAtUriShareBtn",`,
        replace: "$self.openPdsls(),$&",
      }],
    },
  ],

  openPdsls: () => {
    return <div>meow</div>;
  },
});
