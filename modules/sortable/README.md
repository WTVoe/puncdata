# Sortable

Super simple, completely configurable, sortable tables.

## Installation

1. Add the JavaScript before the `</body>` (required)

    ```html
    <script src="sortable.js"></script>
    ```

    or via jsDeliver:

    ```html
    <script src="https://cdn.jsdelivr.net/gh/signified/sortable@1.0.4/sortable.min.js"></script>
    ```

1. Add the stylesheet in the `<head>` (optional)

    ```html
    <link rel="stylesheet" href="sortable.css">
    ```

    or via jsDeliver:

    ```html
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/signified/sortable@1.0.4/sortable.min.css">
    ```

**Note:** The supplied stylesheet applies default styling rules. Feel free to use it as a starting point or, if you're using a framework like Bootstrap or Tailwind CSS, make use of the `options` to take full advantage of the component and utility classes these frameworks provide.

## Usage

Usage examples can be found at https://signified.github.io/sortable.

```javascript
sortable(selectors, options);
```

### `selectors` (string | required)

A string containing one or more selectors to match against. For example, `'table'` will match every `<table>` element.

### `options` (object | optional)

An object representing optional configuration options.

```javascript
{
  // An array of class attribute values to apply to the <button> element that Sortable adds to each <th> element.
  buttonClasses: ['sortable-button'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column.
  sortClasses: ['sortable-sort'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column that has been sorted as a string (alphabetically).
  sortStringClasses: ['sortable-sort-string'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column that has been sorted as a number (numerically).
  sortNumberClasses: ['sortable-sort-number'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column that has been sorted as a date.
  sortDateClasses: ['sortable-sort-date'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column that has been sorted as a dot decimal.
  sortDotDecimalClasses: ['sortable-sort-dot-decimal'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column that has been sorted in ascending order.
  sortAscendingClasses: ['sortable-sort-ascending'],

  // An array of class attribute values to apply to the <th> and each <td> of the currently sorted column that has been sorted in descending order.
  sortDescendingClasses: ['sortable-sort-descending']
}
```

## Contributing

See [Contributing](https://github.com/signified/.github/blob/main/CONTRIBUTING.md).

## Credits

See [Contributors](https://github.com/signified/sortable/graphs/contributors).

## License

See [LICENSE](LICENSE).
