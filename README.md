## Description
A simple gallery plugin for WordPress. I made it to learn the WordPress media uploader and to increase my JavaScript and CSS skills. Note that I don't currently have plans to maintain it, so use it at your own risk.

## Creating and Editing a Gallery
To create a new gallery, go to the **Galleries** tab and press **Add New**.

Use the **Choose images** and **Remove these images** buttons to control which images appear on the gallery.

Click and drag an image to change its location on the gallery.  By default, moving an image will shift over the other images to make room for it.  By toggling the **When dragging an image** switch, you can change this behaviour to swap the image you are dragging with the image you release it onto.

In this screen, you also get to choose how many images will appear as a preview in the frontend lightbox.  This is 7 by default, but you can choose any number or choose to show all images in the preview bar.

## Displaying a Gallery
To display the gallery in a post, insert the shortcode **\[simple_gallery id=<gallery-id>\]** into the post, where **<gallery-id>** is the id of your gallery.  you can find the id when you are editing it: the url will contain something to the effect of "**post=<gallery-id>**". 