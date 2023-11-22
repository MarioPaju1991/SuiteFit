class BookmarksController < ApplicationController
  # Inserted a authorization policy in front of each method as a reminder.
  # When writing the method, put it before saving to the database.
  def index
    @bookmarks = policy_scope(Bookmark)
  end

  def show
    authorize @bookmark
  end

  def create
    @apartment = Apartment.find(params[:apartment_id])
    @bookmark = Bookmark.new
    @bookmark.apartment = @apartment
    @bookmark.user = current_user
    authorize @bookmark
    if @bookmark.save
      redirect_to bookmarks_path(@bookmarks)
    else
      render "apartments/show", status: :unprocessable_entity
    end
  end

  def update
    authorize @bookmark
  end

  def destroy
    authorize @bookmark
  end

end
