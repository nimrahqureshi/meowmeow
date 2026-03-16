/* ============================================================
   AMAZON PRODUCT INDEX
   Initialises window.AmazonProducts = [] then loads all 15 category files.

   LOAD ORDER in HTML (before </body>):
     <script src="js/products/amazon/index.js"></script>
     (Each category file auto-pushes into window.AmazonProducts)

   OR load individual categories only:
     <script src="js/products/amazon/Women.js"></script>
     <script src="js/products/amazon/Electronics.js"></script>
   ============================================================ */

/* Initialise array once — category files push into it */
window.AmazonProducts = [];

/* Metadata used by affiliate-main.js */
window.AmazonProducts._meta = {
  platform:   'Amazon',
  icon:       'fab fa-amazon',
  categories: ['Women', 'Men', 'Kids', 'Shoes', 'Bags', 'Jewelry', 'Watches', 'Beauty', 'Pets', 'Toys', 'Electronics', 'Crafts', 'Home', 'Accessories', 'Flowers']
};
